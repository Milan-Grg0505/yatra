"""Bookings, payment transactions, and coupons."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    ARRAY,
    Boolean,
    Date,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models._mixins import TimestampMixin, UUIDPKMixin
from app.models.enums import (
    BookingStatus,
    DiscountType,
    PaymentMethod,
    PaymentStatus,
)

if TYPE_CHECKING:
    from app.models.hotel import Hotel
    from app.models.review import Review
    from app.models.room import Room
    from app.models.user import User


class Booking(Base, UUIDPKMixin, TimestampMixin):
    __tablename__ = "bookings"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    hotel_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("hotels.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    room_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("rooms.id", ondelete="SET NULL"), nullable=True
    )

    check_in: Mapped[datetime] = mapped_column(Date, nullable=False, index=True)
    check_out: Mapped[datetime] = mapped_column(Date, nullable=False, index=True)
    num: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    guest_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    status: Mapped[BookingStatus] = mapped_column(
        Enum(BookingStatus, name="booking_status"),
        default=BookingStatus.pending,
        nullable=False,
        index=True,
    )
    payment_status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus, name="payment_status"),
        default=PaymentStatus.pending,
        nullable=False,
        index=True,
    )
    payment_method: Mapped[PaymentMethod | None] = mapped_column(
        Enum(PaymentMethod, name="payment_method"), nullable=True
    )
    payment_id: Mapped[str | None] = mapped_column(String(200), nullable=True)

    base_price: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    tax_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    service_charge: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    discount_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_price: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    coupon_code: Mapped[str | None] = mapped_column(String(50), nullable=True)

    special_requests: Mapped[str | None] = mapped_column(Text, nullable=True)
    guest_details: Mapped[list[dict] | None] = mapped_column(JSONB, nullable=True)

    cancelled_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    cancellation_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship(
        "User", back_populates="bookings", lazy="joined"
    )
    hotel: Mapped["Hotel"] = relationship(
        "Hotel", back_populates="bookings", lazy="joined"
    )
    room: Mapped["Room | None"] = relationship("Room", lazy="joined")
    review: Mapped["Review | None"] = relationship(
        "Review", back_populates="booking", uselist=False
    )

    __table_args__ = (
        # Composite index used by availability checks (skipping canceled)
        Index(
            "ix_bookings_hotel_dates_active",
            "hotel_id",
            "check_in",
            "check_out",
            postgresql_where="status != 'canceled'",
        ),
    )


class Transaction(Base, UUIDPKMixin, TimestampMixin):
    """Payment-gateway transaction record (separate from Booking)."""

    __tablename__ = "transactions"

    booking_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("bookings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    transaction_uuid: Mapped[str] = mapped_column(
        String(100), unique=True, index=True, nullable=False
    )
    provider: Mapped[PaymentMethod] = mapped_column(
        Enum(PaymentMethod, name="txn_provider"), nullable=False
    )
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus, name="txn_status"),
        default=PaymentStatus.pending,
        nullable=False,
    )
    ref_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    raw_response: Mapped[dict | None] = mapped_column(JSONB, nullable=True)


class Coupon(Base, UUIDPKMixin, TimestampMixin):
    __tablename__ = "coupons"

    code: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    discount_type: Mapped[DiscountType] = mapped_column(
        Enum(DiscountType, name="discount_type"),
        default=DiscountType.percentage,
        nullable=False,
    )
    discount_value: Mapped[float] = mapped_column(Float, nullable=False)
    min_booking_amount: Mapped[float] = mapped_column(
        Float, default=0.0, nullable=False
    )
    max_discount_amount: Mapped[float | None] = mapped_column(Float, nullable=True)
    valid_from: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    valid_until: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    usage_limit: Mapped[int | None] = mapped_column(Integer, nullable=True)
    used_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    applicable_hotels: Mapped[list[uuid.UUID]] = mapped_column(
        ARRAY(UUID(as_uuid=True)), default=list, nullable=False
    )
    active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
