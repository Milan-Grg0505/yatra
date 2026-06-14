"""Travel package + booking schemas."""

from __future__ import annotations

import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field

from app.models.enums import (
    DifficultyLevel,
    Gender,
    PaymentMethod,
    PaymentStatus,
    TravelBookingStatus,
    TravelPackageStatus,
)
from app.schemas._shared import ORMModel


class ItineraryDay(BaseModel):
    day: int
    title: str
    description: str
    activities: list[str] = []
    meals: list[str] = []


class TravelPackageBase(BaseModel):
    name: str
    description: str
    duration_days: int = Field(ge=1)
    duration_nights: int = Field(ge=0)
    price_per_person: float = Field(ge=0)
    discount_price: float | None = None
    difficulty_level: DifficultyLevel = DifficultyLevel.easy
    group_size_min: int = 1
    group_size_max: int = 20
    inclusions: list[str] = []
    exclusions: list[str] = []
    itinerary: list[ItineraryDay] = []
    hotel_ids: list[uuid.UUID] = []
    city_ids: list[uuid.UUID] = []
    start_city_id: uuid.UUID | None = None
    end_city_id: uuid.UUID | None = None
    status: TravelPackageStatus = TravelPackageStatus.active


class TravelPackageCreate(TravelPackageBase):
    pass


class TravelPackageUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price_per_person: float | None = None
    discount_price: float | None = None
    difficulty_level: DifficultyLevel | None = None
    inclusions: list[str] | None = None
    exclusions: list[str] | None = None
    itinerary: list[ItineraryDay] | None = None
    status: TravelPackageStatus | None = None


class TravelPackageOut(ORMModel):
    id: uuid.UUID
    name: str
    slug: str
    description: str
    duration_days: int
    duration_nights: int
    price_per_person: float
    discount_price: float | None = None
    inclusions: list[str]
    exclusions: list[str]
    itinerary: list[dict]
    hotel_ids: list[uuid.UUID]
    city_ids: list[uuid.UUID]
    start_city_id: uuid.UUID | None = None
    end_city_id: uuid.UUID | None = None
    group_size_min: int
    group_size_max: int
    difficulty_level: DifficultyLevel
    featured_image: str | None = None
    gallery_images: list[str]
    status: TravelPackageStatus
    total_bookings: int
    average_rating: float
    view_count: int


class TravelerDetail(BaseModel):
    full_name: str
    age: int | None = None
    gender: Gender | None = None
    nationality: str | None = None
    id_proof: str | None = None


class TravelBookingCreate(BaseModel):
    package_id: uuid.UUID
    travel_date: date
    number_of_travelers: int = Field(ge=1)
    traveler_details: list[TravelerDetail] = Field(min_length=1)
    special_requirements: str | None = None
    emergency_contact_name: str | None = None
    emergency_contact_phone: str | None = None
    payment_method: PaymentMethod = PaymentMethod.esewa


class TravelBookingOut(ORMModel):
    id: uuid.UUID
    user_id: uuid.UUID
    package_id: uuid.UUID
    travel_date: date
    number_of_travelers: int
    total_price: float
    traveler_details: list[dict]
    special_requirements: str | None = None
    status: TravelBookingStatus
    payment_status: PaymentStatus
    payment_method: PaymentMethod | None = None
    created_at: datetime
