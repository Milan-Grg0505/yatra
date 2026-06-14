"""Hotel endpoints — list/search, CRUD, status, pricing prediction."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Annotated, Any
from sqlalchemy import func, or_, select
from sqlalchemy.orm import selectinload

from fastapi import APIRouter, Depends, Query, UploadFile, File, Request, status

from app.api.deps import (
    AdminUser,
    ApprovedOwnerAdminUser,
    CurrentUser,
    CurrentUserOpt,
    DbDep,
    OwnerAdminUser,
)
from app.core.exceptions import BadRequest, Forbidden, NotFound
from app.core.responses import ok
from app.models.enums import HotelStatus, Role
from app.models.hotel import Facility, Hotel, Photo
from app.models.location import City
from app.models.room import Room
from app.schemas.hotel import (
    HotelCreate,
    HotelOut,
    HotelSearchParams,
    HotelStatusUpdate,
    HotelUpdate,
    PriceBreakdown,
    PricePredictRequest,
)

# from app.services import pricing_service, recommendation_service
from app.utils.cloudinary_util import delete_image, upload_image
from app.utils.pagination import paginate

# Helper to parse multipart form into HotelUpdate model
router = APIRouter(prefix="/hotels", tags=["hotels"])


def _serialize(hotel: Hotel) -> dict[str, Any]:
    return HotelOut.model_validate(hotel).model_dump(mode="json")


async def _parse_hotel_update(request: Request) -> HotelUpdate:
    form = await request.form()
    data: dict[str, Any] = {}
    for key in set(form.keys()):
        values = form.getlist(key)
        if not values or isinstance(values[0], UploadFile):
            continue
        
        if key == "facilities[]":
            data["facility_ids"] = values
        elif key == "policies[]":
            data["policy_ids"] = values
        else:
            val = values[0]
            data[key] = val if val != "" else None
            
    return HotelUpdate(**data)

async def _parse_hotel_create(request: Request) -> HotelCreate:
    form = await request.form()
    data: dict[str, Any] = {}
    for key in set(form.keys()):
        values = form.getlist(key)
        if not values or isinstance(values[0], UploadFile):
            continue
            
        if key == "facilities[]":
            data["facility_ids"] = values
        elif key == "policies[]":
            data["policy_ids"] = values
        else:
            val = values[0]
            data[key] = val if val != "" else None
            
    return HotelCreate(**data)


# ---------------------------------------------------------------------------
# Public read
# ---------------------------------------------------------------------------


@router.get("/")
async def list_hotels(
    db: DbDep,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=200),
) -> dict[str, Any]:
    stmt = (
        select(Hotel)
        .where(
            Hotel.status == HotelStatus.approved,
            Hotel.is_deleted == False,  # noqa: E712
        )
        .order_by(Hotel.popularity_score.desc(), Hotel.created_at.desc())
        .options(
            selectinload(Hotel.city),
            selectinload(Hotel.facilities),
            selectinload(Hotel.photos),
            selectinload(Hotel.rooms),
        )
    )
    rows, meta = await paginate(db, stmt, page=page, limit=limit)
    return ok([_serialize(h) for h in rows], meta=meta)


@router.get("/search")
async def search(
    db: DbDep,
    params: Annotated[HotelSearchParams, Depends()],
) -> dict[str, Any]:
    base = (
        select(Hotel)
        .where(
            Hotel.status == HotelStatus.approved,
            Hotel.is_deleted == False,  # noqa: E712
        )
        .options(
            selectinload(Hotel.city),
            selectinload(Hotel.facilities),
            selectinload(Hotel.photos),
            selectinload(Hotel.rooms),
        )
    )

    if params.q:
        like = f"%{params.q}%"
        base = base.where(or_(Hotel.name.ilike(like), Hotel.description.ilike(like)))

    if params.city:
        base = base.join(City).where(City.name.ilike(f"%{params.city}%"))
    if params.city_id:
        base = base.where(Hotel.city_id == params.city_id)
    if params.hotel_type:
        base = base.where(Hotel.type == params.hotel_type)
    if params.min_rating:
        base = base.where(Hotel.average_review_rating >= params.min_rating)

    if params.min_price or params.max_price:
        room_subq = select(Room.hotel_id).where(
            *[Room.base_price >= params.min_price] if params.min_price else [],
            *[Room.base_price <= params.max_price] if params.max_price else [],
        )
        base = base.where(Hotel.id.in_(room_subq))

    if params.sort == "price_asc":
        base = base.order_by(Hotel.popularity_score.asc())
    elif params.sort == "price_desc":
        base = base.order_by(Hotel.popularity_score.desc())
    elif params.sort == "rating":
        base = base.order_by(Hotel.average_review_rating.desc())
    else:
        base = base.order_by(Hotel.popularity_score.desc())

    rows, meta = await paginate(db, base, page=params.page, limit=params.limit)
    return ok([_serialize(h) for h in rows], meta=meta)


@router.get("/pending")
async def list_pending(_: AdminUser, db: DbDep) -> dict[str, Any]:
    rows = (
        (
            await db.execute(
                select(Hotel)
                .where(
                    Hotel.status == HotelStatus.pending,
                    Hotel.is_deleted == False,  # noqa: E712
                )
                .options(selectinload(Hotel.city), selectinload(Hotel.photos))
            )
        )
        .scalars()
        .all()
    )
    return ok([_serialize(h) for h in rows])


@router.get("/my")
async def my_hotels(me: CurrentUser, db: DbDep) -> dict[str, Any]:
    rows = (
        (
            await db.execute(
                select(Hotel)
                .where(Hotel.owner_id == me.id, Hotel.is_deleted == False)  # noqa: E712
                .options(selectinload(Hotel.city), selectinload(Hotel.photos))
            )
        )
        .scalars()
        .all()
    )
    return ok([_serialize(h) for h in rows])


@router.get("/{hotel_id}")
async def get(db: DbDep, hotel_id: uuid.UUID) -> dict[str, Any]:
    row = (
        (
            await db.execute(
                select(Hotel)
                .where(Hotel.id == hotel_id)
                .options(
                    selectinload(Hotel.city),
                    selectinload(Hotel.facilities),
                    selectinload(Hotel.policies),
                    selectinload(Hotel.photos),
                    selectinload(Hotel.rooms),
                )
            )
        )
        .scalars()
        .first()
    )
    if not row:
        raise NotFound("Hotel not found")
    return ok(_serialize(row))


# ---------------------------------------------------------------------------
# Create / Update / Delete  (owner & admin)
# ---------------------------------------------------------------------------


async def _attach_facilities(db, hotel: Hotel, ids: list[uuid.UUID] | None) -> None:
    if ids is None:
        return
    if ids:
        rows = (
            (await db.execute(select(Facility).where(Facility.id.in_(ids))))
            .scalars()
            .all()
        )
    else:
        rows = []
    hotel.facilities = list(rows)


async def _save_photos(db, hotel: Hotel, files: list[UploadFile]) -> None:
    for f in files:
        if not f.filename:
            continue
        contents = await f.read()
        if not contents:
            continue
        uploaded = await upload_image(contents, folder=f"yatra/hotels/{hotel.id}")
        db.add(
            Photo(
                url=uploaded["url"], public_id=uploaded["public_id"], hotel_id=hotel.id
            )
        )



@router.post("/add", status_code=status.HTTP_201_CREATED)
async def create_hotel(
    me: ApprovedOwnerAdminUser,
    db: DbDep,
    body: HotelCreate = Depends(_parse_hotel_create),
    logo: UploadFile | None = File(None),
    images: list[UploadFile] = File([]),
) -> dict[str, Any]:
    payload = body.model_dump(exclude={"facility_ids"})
    hotel = Hotel(**payload, owner_id=me.id, status=HotelStatus.pending)
    db.add(hotel)
    await db.flush()

    if logo and logo.filename:
        contents = await logo.read()
        if contents:
            uploaded = await upload_image(contents, folder=f"yatra/hotels/{hotel.id}")
            hotel.logo = uploaded["url"]
            hotel.logo_public_id = uploaded["public_id"]

    if images:
        await _save_photos(db, hotel, images)

    await _attach_facilities(db, hotel, body.facility_ids)
    await db.commit()
    await db.refresh(hotel)
    return ok(_serialize(hotel))


@router.put("/edit/{hotel_id}")
async def update_hotel(
    hotel_id: uuid.UUID,
    me: CurrentUser,
    db: DbDep,
    body: HotelUpdate = Depends(_parse_hotel_update),
    logo: UploadFile | None = File(None),
    images: list[UploadFile] = File([]),
) -> dict[str, Any]:
    hotel = (
        await db.execute(select(Hotel).where(Hotel.id == hotel_id))
    ).scalar_one_or_none()
    if not hotel:
        raise NotFound("Hotel not found")
    if me.role != Role.admin and hotel.owner_id != me.id:
        raise Forbidden("You can only edit your own hotels")

    data = body.model_dump(exclude_unset=True, exclude={"facility_ids", "status"})
    for k, v in data.items():
        setattr(hotel, k, v)

    # Only admins may change status
    if body.status is not None and me.role == Role.admin:
        hotel.status = body.status

    if logo and logo.filename:
        contents = await logo.read()
        if contents:
            if hotel.logo_public_id:
                await delete_image(hotel.logo_public_id)
            uploaded = await upload_image(contents, folder=f"yatra/hotels/{hotel.id}")
            hotel.logo = uploaded["url"]
            hotel.logo_public_id = uploaded["public_id"]

    if images:
        await _save_photos(db, hotel, images)

    if body.facility_ids is not None:
        await _attach_facilities(db, hotel, body.facility_ids)

    await db.commit()
    await db.refresh(hotel)
    return ok(_serialize(hotel))


@router.put("/status/{hotel_id}")
async def set_status(
    hotel_id: uuid.UUID, body: HotelStatusUpdate, _: AdminUser, db: DbDep
) -> dict[str, Any]:
    hotel = (
        await db.execute(select(Hotel).where(Hotel.id == hotel_id))
    ).scalar_one_or_none()
    if not hotel:
        raise NotFound("Hotel not found")
    hotel.status = body.status
    await db.commit()
    return ok(_serialize(hotel))


@router.delete("/delete/{hotel_id}")
async def delete_hotel(
    hotel_id: uuid.UUID, me: CurrentUser, db: DbDep
) -> dict[str, Any]:
    hotel = (
        await db.execute(select(Hotel).where(Hotel.id == hotel_id))
    ).scalar_one_or_none()
    if not hotel:
        raise NotFound("Hotel not found")
    if me.role != Role.admin and hotel.owner_id != me.id:
        raise Forbidden("You can only delete your own hotels")
    hotel.is_deleted = True
    hotel.deleted_at = datetime.now(tz=timezone.utc)
    await db.commit()
    return ok(message="Hotel deleted")


# ---------------------------------------------------------------------------
# Dynamic pricing
# ---------------------------------------------------------------------------
# @router.post("/price-predict")
# async def predict_price(body: PricePredictRequest, db: DbDep) -> dict[str, Any]:
#     room = (
#         await db.execute(select(Room).where(Room.id == body.room_id))
#     ).scalar_one_or_none()
#     if not room:
#         raise NotFound("Room not found")

#     from datetime import date as date_cls

#     try:
#         check_in = date_cls.fromisoformat(body.check_in)
#         check_out = date_cls.fromisoformat(body.check_out)
#     except ValueError as exc:
#         raise BadRequest("Invalid date format (expected YYYY-MM-DD)") from exc

#     nights = max(1, (check_out - check_in).days)
#     days_ahead = max(0, (check_in - datetime.now(tz=timezone.utc).date()).days)
#     breakdown = pricing_service.compute_price(
#         base_price=room.base_price,
#         check_in=check_in,
#         nights=nights,
#         days_ahead=days_ahead,
#     )
#     return ok(PriceBreakdown(**breakdown).model_dump(mode="json"))
