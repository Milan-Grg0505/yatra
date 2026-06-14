"""Travel packages + travel bookings."""

from __future__ import annotations

from datetime import datetime
from time import timezone

from app.core.exceptions import BadRequest, Conflict, Forbidden
from app.models.enums import Role

import uuid
from typing import Any

from fastapi import APIRouter, Query, status
from sqlalchemy import func, select

from app.api.deps import AdminUser, CurrentUser, DbDep
from app.core.exceptions import NotFound
from app.core.responses import ok
from app.models.location import City
from app.models.travel import TravelBooking, TravelPackage
from app.schemas.travel import (
    TravelBookingCreate,
    TravelBookingOut,
    TravelPackageCreate,
    TravelPackageOut,
    TravelPackageUpdate,
)
from app.utils.pagination import paginate, slugify

router = APIRouter(prefix="/travel", tags=["travel"])


def _pkg(p: TravelPackage) -> dict[str, Any]:
    return TravelPackageOut.model_validate(p).model_dump(mode="json")


def _tb(b: TravelBooking) -> dict[str, Any]:
    return TravelBookingOut.model_validate(b).model_dump(mode="json")


# A dictionary is Python's version of a JSON object - it's a key-value store.

# The -> dict[str, Any] Return Type
# Every FastAPI endpoint returns dict[str, Any] because FastAPI automatically converts dictionaries to JSON.


# ---- Packages -------------------------------------------------------------
@router.get("/packages")
async def list_packages(
    db: DbDep,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=200),
    difficulty: str | None = Query(None),
) -> dict[str, Any]:
    stmt = select(TravelPackage).order_by(TravelPackage.created_at.desc())
    if difficulty:
        stmt = stmt.where(TravelPackage.difficulty_level == difficulty)
    rows, meta = await paginate(db, stmt, page=page, limit=limit)
    return ok([_pkg(p) for p in rows], meta=meta)


@router.get("/packages/{package_id}")
async def get_package(package_id: uuid.UUID, db: DbDep) -> dict[str, Any]:
    p = (
        await db.execute(select(TravelPackage).where(TravelPackage.id == package_id))
    ).scalar_one_or_none()
    if not p:
        raise NotFound("Package not found")
    p.view_count += 1
    await db.commit()
    return ok(_pkg(p))


@router.get("/destinations")
async def package_destinations(db: DbDep) -> dict[str, Any]:
    rows = (
        await db.execute(
            select(
                City.id,
                City.name,
                City.image,
                func.count(TravelPackage.id).label("count"),
            )
            .where(City.id == func.any(TravelPackage.city_ids))
            .group_by(City.id, City.name, City.image)
            .order_by(func.count(TravelPackage.id).desc())
        )
    ).all()
    return ok(
        [
            {"_id": str(r[0]), "name": r[1], "image": r[2], "count": int(r[3])}
            for r in rows
        ]
    )


@router.get("/recommendations")
async def package_recommendations(db: DbDep, limit: int = 8) -> dict[str, Any]:
    rows = (
        (
            await db.execute(
                select(TravelPackage)
                .order_by(TravelPackage.total_bookings.desc())
                .limit(limit)
            )
        )
        .scalars()
        .all()
    )
    return ok([_pkg(p) for p in rows])


@router.post("/packages/add", status_code=status.HTTP_201_CREATED)
async def create_package(
    body: TravelPackageCreate, _: AdminUser, db: DbDep
) -> dict[str, Any]:
    data = body.model_dump()
    data["itinerary"] = [d.model_dump() for d in body.itinerary]
    # Now itinerary is list of dicts - database can store as JSON!
    pkg = TravelPackage(**data, slug=f"{slugify(body.name)}-{uuid.uuid4().hex[:6]}")
    db.add(pkg)
    await db.commit()
    await db.refresh(pkg)
    return ok(_pkg(pkg))


@router.put("/packages/edit/{package_id}")
async def update_package(
    package_id: uuid.UUID, body: TravelPackageUpdate, _: AdminUser, db: DbDep
) -> dict[str, Any]:
    pkg = (
        await db.execute(select(TravelPackage).where(TravelPackage.id == package_id))
    ).scalar_one_or_none()
    if not pkg:
        raise NotFound("Package not found")
    data = body.model_dump(exclude_unset=True)
    if "itinerary" in data and data["itinerary"]:
        data["itinerary"] = [
            d.model_dump() if hasattr(d, "model_dump") else d for d in data["itinerary"]
        ]
    for k, v in data.items():
        setattr(pkg, k, v)
    await db.commit()
    return ok(_pkg(pkg))


@router.delete("/packages/delete/{package_id}")
async def delete_package(
    package_id: uuid.UUID, _: AdminUser, db: DbDep
) -> dict[str, Any]:
    pkg = (
        await db.execute(select(TravelPackage).where(TravelPackage.id == package_id))
    ).scalar_one_or_none()
    if not pkg:
        raise NotFound("Package not found")
    await db.delete(pkg)
    await db.commit()
    return ok(message="Deleted")


# ---- Travel bookings -------------------------------------------------------
@router.post("/book", status_code=status.HTTP_201_CREATED)
async def book_package(
    body: TravelBookingCreate, me: CurrentUser, db: DbDep
) -> dict[str, Any]:
    pkg = (
        await db.execute(
            select(TravelPackage).where(TravelPackage.id == body.package_id)
        )
    ).scalar_one_or_none()
    if not pkg:
        raise NotFound("Package not found")
    #  Check if package has capacity
    if pkg.max_capacity and pkg.total_bookings >= pkg.max_capacity:
        raise Conflict("Package is fully booked")
    # Validate travel date
    if body.travel_date < datetime.now().date():
        raise BadRequest("Cannot book for a past date")

    # Check for date conflicts (if date-specific)
    existing = await db.execute(
        select(TravelBooking).where(
            TravelBooking.package_id == body.package_id,
            TravelBooking.travel_date == body.travel_date,
            TravelBooking.status != "cancelled",
        )
    )
    if existing.scalar_one_or_none():
        raise Conflict("This date is already fully booked")

    total = (pkg.discount_price or pkg.price_per_person) * body.number_of_travelers

    booking = TravelBooking(
        user_id=me.id,
        package_id=body.package_id,
        travel_date=body.travel_date,
        number_of_travelers=body.number_of_travelers,
        total_price=total,
        traveler_details=[t.model_dump() for t in body.traveler_details],
        special_requirements=body.special_requirements,
        emergency_contact_name=body.emergency_contact_name,
        emergency_contact_phone=body.emergency_contact_phone,
        payment_method=body.payment_method,
    )
    pkg.total_bookings += 1
    db.add(booking)
    await db.commit()
    await db.refresh(booking)
    return ok(_tb(booking))


@router.get("/my-bookings")
async def my_bookings(me: CurrentUser, db: DbDep) -> dict[str, Any]:
    rows = (
        (
            await db.execute(
                select(TravelBooking)
                .where(TravelBooking.user_id == me.id)
                .order_by(TravelBooking.created_at.desc())
            )
        )
        .scalars()
        .all()
    )
    return ok([_tb(b) for b in rows])


@router.get("/my-bookings/{booking_id}")
async def get_booking(
    booking_id: uuid.UUID, me: CurrentUser, db: DbDep
) -> dict[str, Any]:
    b = (
        (await db.execute(select(TravelBooking).where(TravelBooking.id == booking_id)))
        .scalars()
        .first()
    )
    if not b:
        raise NotFound("Booking not found")
    if b.user_id != me.id and me.role != Role.admin:
        raise Forbidden("You are not authorized to view this booking")
    return ok(_tb(b))


@router.put("/my-bookings/{booking_id}/cancel", status_code=status.HTTP_200_OK)
async def cancel_booking(
    booking_id: uuid.UUID, me: CurrentUser, db: DbDep
) -> dict[str, Any]:
    b = (
        (await db.execute(select(TravelBooking).where(TravelBooking.id == booking_id)))
        .scalars()
        .first()
    )
    if not b:
        raise NotFound("Booking not found")
    if b.user_id != me.id:
        raise Forbidden("You are not authorized to cancel this booking")
    if b.payment_status not in ("pending", "paid"):
        raise BadRequest("Booking cannot be cancelled")

    b.payment_status = "cancelled"
    b.status = "cancelled"
    b.cancel_date = datetime.now(timezone.utc)

    await db.commit()
    return ok(_tb(b))
