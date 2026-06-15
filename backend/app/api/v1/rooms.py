from app.schemas.room import RoomUpdate
from app.core.exceptions import Forbidden
from app.models.enums import Role
from app.models import Hotel
from app.schemas.room import RoomCreate
from app.api.deps import OwnerAdminUser
from app.core.exceptions import NotFound
from sqlalchemy import and_
from app.models.enums import BookingStatus
from sqlalchemy import func
from app.models import Booking
import uuid
from app.api.deps import DbDep
from app.models.room import Room
from typing import Any
from fastapi import APIRouter, Query, UploadFile, status
from app.schemas.room import RoomOut
from sqlalchemy import select
from app.core.responses import ok
from datetime import date as date_cls

router = APIRouter(prefix="/rooms", tags=["rooms"])


def _ser(r: Room) -> dict[str, Any]:
    return RoomOut.model_validate(r).model_dump(mode="json")


@router.get("")
async def list_rooms(db: DbDep, hotel_id: uuid.UUID | None = Query(None)):
    stmt = select(Room)
    if hotel_id:
        stmt = stmt.where(Room.hotel_id == hotel_id)
    rows = (await db.execute(stmt)).scalars().all()
    return ok([_ser(r) for r in rows])


@router.get("/available")
async def available_rooms(
    db: DbDep,
    hotel_id: uuid.UUID = Query(...),
    check_in: str = Query(...),
    check_out: str = Query(...),
    num: int = Query(1, ge=1),
) -> dict[str, Any]:
    ci = date_cls.fromisoformat(check_in)
    co = date_cls.fromisoformat(check_out)

    rooms = (
        (await db.execute(select(Room).where(Room.hotel_id == hotel_id)))
        .scalars()
        .all()
    )
    if not rooms:
        return ok([])

    # compute use inventiry per room in the date range
    used_rows = (
        await db.execute(
            select(Booking.room_id, func.sum(Booking.num).label("used"))
            .where(
                Booking.room_id.in_([r.id for r in rooms]),  # Only these rooms
                Booking.status != BookingStatus.canceled,  # Exclude canceled
                and_(
                    Booking.check_in <= co,  # Booking starts ON or BEFORE checkout date
                    Booking.check_out >= ci,  # Booking ends ON or AFTER checkin date
                ),
            )
            .group_by(Booking.room_id)  # Group by room
        )
    ).all()

    # Example: {room_id_1: 3, room_id_2: 2, room_id_3: 0}
    used_map = {r[0]: int(r[1] or 0) for r in used_rows}

    available_rooms = []
    for r in rooms:
        used = used_map.get(r.id, 0)  # Get booked count (0 if none)
        avail = max(0, r.number_of_rooms - used)  # Calculate available
        if avail >= num:  # Only add rooms with enough availability
            data = _ser(r)
            data["available_count"] = avail
            available_rooms.append(data)
        return ok(available_rooms)


@router.get("/{room_id}")
async def get_room(db: DbDep, room_id: uuid.UUID):
    room = (
        await db.execute(select(Room).where(Room.id == room_id))
    ).scalar_one_or_none()
    if not room:
        raise NotFound
    return ok(_ser(room))


@router.post("/add", status_code=status.HTTP_201_CREATED)
async def create_room(
    body: RoomCreate, me: OwnerAdminUser, db: DbDep
) -> dict[str, Any]:
    hotel = (
        await db.execute(select(Hotel).where(Hotel.id == body.hotel_id))
    ).scalar_one_or_none()
    if not hotel:
        raise NotFound("Hotel not found")

    if me.role != Role.admin and hotel.owner_id != me.id:
        raise Forbidden("Not your hotel")

    room = Room(**body.model_dump())
    db.add(room)
    await db.commit()
    await db.refresh(room)
    return ok(_ser(room))


@router.put("/edit/{room_id}")
async def edit_room(
    room_id: uuid.UUID,
    body: RoomUpdate,
    me: OwnerAdminUser,
    db: DbDep,
    images: list[UploadFile] = [],
) -> dict[str, Any]:
    room = (
        await db.execute(select(Room).where(Room.id == room_id))
    ).scalar_one_or_none()
    if not room:
        raise NotFound("Room not found")
    hotel = (
        await db.execute(select(Hotel).where(Hotel.id == room.hotel_id))
    ).scalar_one_or_none()
    if not hotel or (me.role != Role.admin and hotel.owner_id != me.id):
        raise Forbidden("Not your hotel")

    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(room, k, v)

    if images:
        new_urls: list[str] = list(room.images or [])
        for img in images:
            contents = await img.read()
            if not contents:
                continue
            uploaded = await upload_image(contents, folder=f"yatra/rooms/{hotel.id}")
            new_urls.append(uploaded["url"])
        room.images = new_urls

    await db.commit()
    await db.refresh(room)
    return ok(_ser(room))


@router.delete("/delete/{room_id}")
async def delete_room(
    room_id: uuid.UUID, me: OwnerAdminUser, db: DbDep
) -> dict[str, Any]:
    room = (
        await db.execute(select(Room).where(Room.id == room_id))
    ).scalar_one_or_none()
    if not room:
        raise NotFound("Room not found")
    hotel = (
        await db.execute(select(Hotel).where(Hotel.id == room.hotel_id))
    ).scalar_one_or_none()
    if not hotel or (me.role != Role.admin and hotel.owner_id != me.id):
        raise Forbidden("Not your hotel")
    await db.delete(room)
    await db.commit()
    return ok(message="Room deleted")
