"""Hotel and its supporting catalog (facilities, services, policies, photos)."""

from __future__ import annotations

import uuid
from datetime import time
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    Column,
    Enum,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Table,
    Text,
    Time,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models._mixins import SoftDeleteMixin, TimestampMixin, UUIDPKMixin
from app.models.enums import CancellationPolicy, HotelStatus, HotelType

if TYPE_CHECKING:
    from app.models.booking import Booking
    from app.models.location import City
    from app.models.review import Review
    from app.models.room import Room
    from app.models.user import User


# --- Association tables -----------------------------------------------------
hotel_facilities = Table(
    "hotel_facilities",
    Base.metadata,
    Column(
        "hotel_id",
        UUID(as_uuid=True),
        ForeignKey("hotels.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "facility_id",
        UUID(as_uuid=True),
        ForeignKey("facilities.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)

room_services = Table(
    "room_services",
    Base.metadata,
    Column(
        "room_id",
        UUID(as_uuid=True),
        ForeignKey("rooms.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "service_id",
        UUID(as_uuid=True),
        ForeignKey("services.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


# --- Catalog entities --------------------------------------------------------
class Facility(Base, UUIDPKMixin, TimestampMixin):
    __tablename__ = "facilities"

    name: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    icon: Mapped[str | None] = mapped_column(String(80), nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Service(Base, UUIDPKMixin, TimestampMixin):
    __tablename__ = "services"

    name: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    icon: Mapped[str | None] = mapped_column(String(80), nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Policy(Base, UUIDPKMixin, TimestampMixin):
    __tablename__ = "policies"

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    hotel_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("hotels.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    hotel: Mapped["Hotel | None"] = relationship("Hotel", back_populates="policies")


class Photo(Base, UUIDPKMixin, TimestampMixin):
    __tablename__ = "photos"

    url: Mapped[str] = mapped_column(String(500), nullable=False)
    public_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    hotel_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("hotels.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    caption: Mapped[str | None] = mapped_column(String(255), nullable=True)
    # AI-tagged amenities & flags (from vision_analyzer)
    ai_tags: Mapped[list[str] | None] = mapped_column("ai_tags", Text, nullable=True)
    ai_quality_score: Mapped[float | None] = mapped_column(Float, nullable=True)

    hotel: Mapped["Hotel"] = relationship("Hotel", back_populates="photos")


# --- Hotel -------------------------------------------------------------------
class Hotel(Base, UUIDPKMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "hotels"

    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    pan_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    logo: Mapped[str | None] = mapped_column(String(500), nullable=True)
    logo_public_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    type: Mapped[HotelType] = mapped_column(
        Enum(HotelType, name="hotel_type"), default=HotelType.hotel, nullable=False
    )
    status: Mapped[HotelStatus] = mapped_column(
        Enum(HotelStatus, name="hotel_status"),
        default=HotelStatus.pending,
        nullable=False,
        index=True,
    )

    city_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("cities.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    owner_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    street: Mapped[str | None] = mapped_column(String(120), nullable=True)
    zip_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True, index=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True, index=True)

    check_in_time: Mapped[time] = mapped_column(
        Time, default=time(14, 0), nullable=False
    )
    check_out_time: Mapped[time] = mapped_column(
        Time, default=time(12, 0), nullable=False
    )

    cancellation_policy: Mapped[CancellationPolicy] = mapped_column(
        Enum(CancellationPolicy, name="cancellation_policy"),
        default=CancellationPolicy.flexible,
        nullable=False,
    )
    cancellation_deadline_hours: Mapped[int] = mapped_column(
        Integer, default=24, nullable=False
    )
    cancellation_fee_percentage: Mapped[float] = mapped_column(
        Float, default=0.0, nullable=False
    )
    tax_percentage: Mapped[float] = mapped_column(Float, default=13.0, nullable=False)
    service_charge_percentage: Mapped[float] = mapped_column(
        Float, default=10.0, nullable=False
    )
    min_advance_booking_days: Mapped[int] = mapped_column(
        Integer, default=0, nullable=False
    )
    max_advance_booking_days: Mapped[int] = mapped_column(
        Integer, default=365, nullable=False
    )
    min_stay_nights: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    # Aggregates (denormalised for fast list queries)
    rating: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    rating_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    average_review_rating: Mapped[float] = mapped_column(
        Float, default=0.0, nullable=False
    )
    total_reviews: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    view_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    booking_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    popularity_score: Mapped[float] = mapped_column(
        Float, default=0.0, nullable=False, index=True
    )

    # Relationships
    city: Mapped["City | None"] = relationship(
        "City", back_populates="hotels", lazy="joined"
    )
    owner: Mapped["User | None"] = relationship(
        "User", back_populates="owned_hotels", foreign_keys=[owner_id]
    )
    facilities: Mapped[list["Facility"]] = relationship(
        "Facility", secondary=hotel_facilities, lazy="selectin"
    )
    policies: Mapped[list["Policy"]] = relationship(
        "Policy", back_populates="hotel", lazy="selectin"
    )
    photos: Mapped[list["Photo"]] = relationship(
        "Photo", back_populates="hotel", lazy="selectin", cascade="all, delete-orphan"
    )
    rooms: Mapped[list["Room"]] = relationship(
        "Room", back_populates="hotel", lazy="selectin", cascade="all, delete-orphan"
    )
    bookings: Mapped[list["Booking"]] = relationship(
        "Booking", back_populates="hotel", lazy="select"
    )
    reviews: Mapped[list["Review"]] = relationship(
        "Review", back_populates="hotel", lazy="select"
    )

    __table_args__ = (
        Index("ix_hotels_status_city", "status", "city_id"),
        Index("ix_hotels_lat_lng", "latitude", "longitude"),
    )
