"""User review of a hotel."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    ARRAY,
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models._mixins import TimestampMixin, UUIDPKMixin
from app.models.enums import ReviewStatus, Sentiment

if TYPE_CHECKING:
    from app.models.booking import Booking
    from app.models.hotel import Hotel
    from app.models.user import User


class Review(Base, UUIDPKMixin, TimestampMixin):
    __tablename__ = "reviews"

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
    booking_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("bookings.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )

    rating: Mapped[float] = mapped_column(Float, nullable=False)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    comment: Mapped[str] = mapped_column(Text, nullable=False)
    images: Mapped[list[str]] = mapped_column(
        ARRAY(String), default=list, nullable=False
    )

    helpful_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    helpful_by: Mapped[list[uuid.UUID]] = mapped_column(
        ARRAY(UUID(as_uuid=True)), default=list, nullable=False
    )
    reported: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    owner_response: Mapped[str | None] = mapped_column(Text, nullable=True)
    owner_response_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    status: Mapped[ReviewStatus] = mapped_column(
        Enum(ReviewStatus, name="review_status"),
        default=ReviewStatus.pending,
        nullable=False,
        index=True,
    )
    # AI annotations (filled async by sentiment service)
    sentiment: Mapped[Sentiment | None] = mapped_column(
        Enum(Sentiment, name="sentiment"), nullable=True
    )
    sentiment_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    topics: Mapped[list[str]] = mapped_column(
        ARRAY(String), default=list, nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="reviews", lazy="joined")
    hotel: Mapped["Hotel"] = relationship(
        "Hotel", back_populates="reviews", lazy="joined"
    )
    booking: Mapped["Booking"] = relationship("Booking", back_populates="review")
