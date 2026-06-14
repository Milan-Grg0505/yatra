"""Travel packages and travel bookings."""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    ARRAY,
    Date,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models._mixins import TimestampMixin, UUIDPKMixin
from app.models.enums import (
    DifficultyLevel,
    PaymentMethod,
    PaymentStatus,
    TravelBookingStatus,
    TravelPackageStatus,
)

if TYPE_CHECKING:
    pass


class TravelPackage(Base, UUIDPKMixin, TimestampMixin):
    __tablename__ = "travel_packages"

    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(
        String(220), unique=True, nullable=False, index=True
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)

    duration_days: Mapped[int] = mapped_column(Integer, nullable=False)
    duration_nights: Mapped[int] = mapped_column(Integer, nullable=False)

    price_per_person: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    discount_price: Mapped[float | None] = mapped_column(Float, nullable=True)

    inclusions: Mapped[list[str]] = mapped_column(
        ARRAY(String), default=list, nullable=False
    )
    exclusions: Mapped[list[str]] = mapped_column(
        ARRAY(String), default=list, nullable=False
    )

    # Day-by-day plan stored as JSONB ([{day, title, description, activities, meals}, ...])
    itinerary: Mapped[list[dict]] = mapped_column(JSONB, default=list, nullable=False)

    hotel_ids: Mapped[list[uuid.UUID]] = mapped_column(
        ARRAY(UUID(as_uuid=True)), default=list, nullable=False
    )
    city_ids: Mapped[list[uuid.UUID]] = mapped_column(
        ARRAY(UUID(as_uuid=True)), default=list, nullable=False
    )
    start_city_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )
    end_city_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )

    group_size_min: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    group_size_max: Mapped[int] = mapped_column(Integer, default=20, nullable=False)

    difficulty_level: Mapped[DifficultyLevel] = mapped_column(
        Enum(DifficultyLevel, name="difficulty_level"),
        default=DifficultyLevel.easy,
        nullable=False,
    )

    season_start: Mapped[date | None] = mapped_column(Date, nullable=True)
    season_end: Mapped[date | None] = mapped_column(Date, nullable=True)

    featured_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    gallery_images: Mapped[list[str]] = mapped_column(
        ARRAY(String), default=list, nullable=False
    )

    status: Mapped[TravelPackageStatus] = mapped_column(
        Enum(TravelPackageStatus, name="travel_package_status"),
        default=TravelPackageStatus.active,
        nullable=False,
        index=True,
    )

    total_bookings: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    average_rating: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    view_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class TravelBooking(Base, UUIDPKMixin, TimestampMixin):
    __tablename__ = "travel_bookings"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    package_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("travel_packages.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    travel_date: Mapped[date] = mapped_column(Date, nullable=False)
    number_of_travelers: Mapped[int] = mapped_column(Integer, nullable=False)
    total_price: Mapped[float] = mapped_column(Float, nullable=False)

    traveler_details: Mapped[list[dict]] = mapped_column(
        JSONB, default=list, nullable=False
    )
    special_requirements: Mapped[str | None] = mapped_column(Text, nullable=True)
    emergency_contact_name: Mapped[str | None] = mapped_column(
        String(120), nullable=True
    )
    emergency_contact_phone: Mapped[str | None] = mapped_column(
        String(20), nullable=True
    )

    status: Mapped[TravelBookingStatus] = mapped_column(
        Enum(TravelBookingStatus, name="travel_booking_status"),
        default=TravelBookingStatus.pending,
        nullable=False,
    )
    payment_status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus, name="tb_payment_status"),
        default=PaymentStatus.pending,
        nullable=False,
    )
    payment_method: Mapped[PaymentMethod | None] = mapped_column(
        Enum(PaymentMethod, name="tb_payment_method"), nullable=True
    )
    payment_id: Mapped[str | None] = mapped_column(String(200), nullable=True)
    cancelled_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    cancellation_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
