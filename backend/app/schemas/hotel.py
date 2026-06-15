"""Hotel + catalog schemas."""

from __future__ import annotations
from enum import Enum

import uuid
from datetime import time
from typing import Any

from pydantic import BaseModel, EmailStr, Field

from app.models.enums import CancellationPolicy, HotelStatus, HotelType
from app.schemas._shared import ORMModel


# ------------------------------ Catalog -------------------------------------
class FacilityOut(ORMModel):
    id: uuid.UUID
    name: str
    icon: str | None = None
    active: bool


class FacilityIn(BaseModel):
    name: str
    icon: str | None = None
    active: bool = True


class ServiceOut(ORMModel):
    id: uuid.UUID
    name: str
    icon: str | None = None
    active: bool


class ServiceIn(BaseModel):
    name: str
    icon: str | None = None
    active: bool = True


class PolicyOut(ORMModel):
    id: uuid.UUID
    title: str
    description: str | None = None
    hotel_id: uuid.UUID | None = None


class PolicyIn(BaseModel):
    title: str
    description: str | None = None
    hotel_id: uuid.UUID | None = None


class CityOut(ORMModel):
    id: uuid.UUID
    name: str
    country: str
    image: str | None = None
    description: str | None = None
    latitude: float | None = None
    longitude: float | None = None


class CityIn(BaseModel):
    name: str
    country: str = "Nepal"
    description: str | None = None
    latitude: float | None = None
    longitude: float | None = None


class PhotoOut(ORMModel):
    id: uuid.UUID
    url: str
    public_id: str | None = None
    hotel_id: uuid.UUID
    caption: str | None = None
    ai_tags: list[str] | None = None
    ai_quality_score: float | None = None


# ------------------------------ Hotel ---------------------------------------
class HotelBase(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    email: EmailStr | None = None
    phone: str | None = None
    pan_number: str | None = None
    description: str | None = None
    type: HotelType = HotelType.hotel
    city_id: uuid.UUID | None = None
    address: str | None = None
    street: str | None = None
    zip_code: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    check_in_time: time = time(14, 0)
    check_out_time: time = time(12, 0)
    cancellation_policy: CancellationPolicy = CancellationPolicy.flexible
    cancellation_deadline_hours: int = 24
    cancellation_fee_percentage: float = 0.0
    tax_percentage: float = 13.0
    service_charge_percentage: float = 10.0
    min_stay_nights: int = 1


class HotelCreate(HotelBase):
    facility_ids: list[uuid.UUID] = []


class HotelUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    description: str | None = None
    type: HotelType | None = None
    city_id: uuid.UUID | None = None
    address: str | None = None
    street: str | None = None
    zip_code: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    check_in_time: time | None = None
    check_out_time: time | None = None
    cancellation_policy: CancellationPolicy | None = None
    tax_percentage: float | None = None
    service_charge_percentage: float | None = None
    facility_ids: list[uuid.UUID] | None = None
    status: HotelStatus | None = None  # admin-only enforced at route level


class HotelStatusUpdate(BaseModel):
    status: HotelStatus


class HotelOut(ORMModel):
    id: uuid.UUID
    name: str
    email: str | None = None
    phone: str | None = None
    pan_number: str | None = None
    logo: str | None = None
    description: str | None = None
    type: HotelType
    status: HotelStatus
    city_id: uuid.UUID | None = None
    owner_id: uuid.UUID | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    check_in_time: time
    check_out_time: time
    cancellation_policy: CancellationPolicy
    tax_percentage: float
    service_charge_percentage: float
    rating: float
    average_review_rating: float
    total_reviews: int
    booking_count: int
    popularity_score: float
    city: CityOut | None = None
    facilities: list[FacilityOut] = []
    policies: list[PolicyOut] = []
    photos: list[PhotoOut] = []


class SortBy(str, Enum):
    PRICE_ASC = "price_asc"
    PRICE_DESC = "price_desc"
    RATING_ASC = "rating_asc"
    RATING_DESC = "rating_desc"
    POPULARITY_ASC = "popularity_asc"
    POPULARITY_DESC = "popularity_desc"
    NAME_ASC = "name_asc"
    NAME_DESC = "name_desc"


class RoomType(str, Enum):
    SINGLE = "single"
    DOUBLE = "double"
    TWIN = "twin"
    SUITE = "suite"
    DELUXE = "deluxe"
    FAMILY = "family"


class PropertyType(str, Enum):
    HOTEL = "hotel"
    RESORT = "resort"
    HOSTEL = "hostel"
    HOMESTAY = "homestay"
    VILLA = "villa"
    APARTMENT = "apartment"


class AmenityType(str, Enum):
    WIFI = "wifi"
    PARKING = "parking"
    POOL = "pool"
    SPA = "spa"
    GYM = "gym"
    RESTAURANT = "restaurant"
    ROOM_SERVICE = "room_service"
    AIRPORT_SHUTTLE = "airport_shuttle"
    PET_FRIENDLY = "pet_friendly"
    FAMILY_ROOMS = "family_rooms"
    NON_SMOKING = "non_smoking"
    AIR_CONDITIONING = "air_conditioning"
    BREAKFAST = "breakfast"
    LAUNDRY = "laundry"
    BAR = "bar"


class HotelSearchParams(BaseModel):
    q: str | None = None
    city: str | None = None
    city_id: uuid.UUID | None = None
    hotel_type: HotelType | None = None
    check_in: str | None = None
    check_out: str | None = None
    min_price: float | None = None
    max_price: float | None = None
    min_rating: float | None = None
    guests: int | None = None
    page: int = 1
    limit: int = 20
    sort: str = "popularity"  # popularity | price_asc | price_desc | rating


class PricePredictRequest(BaseModel):
    room_id: uuid.UUID
    check_in: str
    check_out: str


class PriceBreakdown(BaseModel):
    price_per_night: float
    nights: int
    total: float
    breakdown: dict[str, Any]
