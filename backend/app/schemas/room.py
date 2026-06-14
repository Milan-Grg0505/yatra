"""Room schemas."""

from __future__ import annotations

import uuid

from pydantic import BaseModel, Field

from app.models.enums import BedType, RoomType, SmokingPolicy, ViewType
from app.schemas._shared import ORMModel
from app.schemas.hotel import ServiceOut


class RoomBase(BaseModel):
    hotel_id: uuid.UUID
    room_type: RoomType = RoomType.double
    room_name: str
    number_of_rooms: int = Field(ge=1, default=1)
    bed_type: BedType = BedType.double
    number_of_beds: int = Field(ge=1, default=1)
    smoking_policy: SmokingPolicy = SmokingPolicy.non_smoking
    base_price: float = Field(ge=0)
    max_guest: int = Field(ge=1, default=2)
    room_size: str | None = None
    discount_percentage: float = Field(ge=0, le=100, default=0)
    amenities: list[str] = []
    view_type: ViewType = ViewType.none
    has_ac: bool = False
    has_wifi: bool = True
    has_tv: bool = False
    has_minibar: bool = False
    has_safe: bool = False


class RoomCreate(RoomBase):
    pass


class RoomUpdate(BaseModel):
    room_name: str | None = None
    room_type: RoomType | None = None
    number_of_rooms: int | None = None
    bed_type: BedType | None = None
    number_of_beds: int | None = None
    base_price: float | None = None
    max_guest: int | None = None
    discount_percentage: float | None = None
    amenities: list[str] | None = None
    view_type: ViewType | None = None
    has_ac: bool | None = None
    has_wifi: bool | None = None
    has_tv: bool | None = None
    has_minibar: bool | None = None
    has_safe: bool | None = None


class RoomOut(ORMModel):
    id: uuid.UUID
    hotel_id: uuid.UUID
    room_type: RoomType
    room_name: str
    number_of_rooms: int
    bed_type: BedType
    number_of_beds: int
    smoking_policy: SmokingPolicy
    base_price: float
    max_guest: int
    discount_percentage: float
    amenities: list[str]
    view_type: ViewType
    has_ac: bool
    has_wifi: bool
    has_tv: bool
    has_minibar: bool
    has_safe: bool
    images: list[str]
    services: list[ServiceOut] = []
