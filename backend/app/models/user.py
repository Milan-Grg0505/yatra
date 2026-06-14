from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    ARRAY,
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import mapped_column, Mapped, relationship
from app.models._mixins import SoftDeleteMixin, TimestampMixin, UUIDPKMixin
from app.core.database import Base

from app.models.enums import OtpType, Role

if TYPE_CHECKING:
    from app.models.booking import Booking
    from app.models.hotel import Hotel
    from app.models.content import Notification
    from app.models.review import Review


class User(Base, UUIDPKMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "users"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    password_hash: Mapped[str | None] = mapped_column(
        String(255), nullable=True
    )  # null when google_only
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)
    address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    image_public_id: Mapped[str | None] = mapped_column(String(255), nullable=True)

    role: Mapped[Role] = mapped_column(
        Enum(Role, name="user_role"),
        default=Role.user,
        server_default=Role.user.value,
        nullable=False,
    )

    google_id: Mapped[str | None] = mapped_column(
        String(255), unique=True, nullable=True
    )
    is_email_verified: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    is_approved: Mapped[bool | None] = mapped_column(
        Boolean, nullable=True, default=None
    )
    last_login: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # JSON blobs (Postgres native JSONB)
    preferences: Mapped[dict] = mapped_column(
        JSONB,
        default=lambda: {
            "theme": "light",
            "language": "en",
            "currency": "NPR",
            "notifications": True,
        },
        nullable=False,
    )

    travel_style: Mapped[list[str]] = mapped_column(
        ARRAY(String), default=list, server_default="{}", nullable=False
    )
    favorite_hotels: Mapped[list[uuid.UUID]] = mapped_column(
        ARRAY(UUID(as_uuid=True)), default=list, server_default="{}", nullable=False
    )
    wishlist: Mapped[list[uuid.UUID]] = mapped_column(
        ARRAY(UUID(as_uuid=True)), default=list, server_default="{}", nullable=False
    )

    # Relationships
    bookings: Mapped[list["Booking"]] = relationship(
        "Booking", back_populates="user", cascade="all, delete-orphan", lazy="select"
    )
    reviews: Mapped[list["Review"]] = relationship(
        "Review", back_populates="user", cascade="all, delete-orphan", lazy="select"
    )
    notifications: Mapped[list["Notification"]] = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="select",
    )
    owned_hotels: Mapped[list["Hotel"]] = relationship(
        "Hotel", back_populates="owner", foreign_keys="Hotel.owner_id", lazy="select"
    )

    @property
    def is_admin(self) -> bool:
        return self.role == Role.admin

    @property
    def is_owner(self) -> bool:
        return self.role == Role.owner


class Otp(Base, UUIDPKMixin, TimestampMixin):
    __tablename__ = "otps"

    email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    code_hash: Mapped[str] = mapped_column(
        String(255), nullable=False
    )  # store hashed, not raw
    type: Mapped[OtpType] = mapped_column(
        Enum(OtpType, name="otp_type"), nullable=False
    )
    new_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    used: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    __table_args__ = (Index("ix_otps_email_type", "email", "type"),)


class RefreshToken(Base, UUIDPKMixin, TimestampMixin):
    """Persistent refresh-token store — supports rotation & revocation."""

    __tablename__ = "refresh_tokens"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    jti: Mapped[str] = mapped_column(
        String(64), unique=True, index=True, nullable=False
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    revoked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(64), nullable=True)


class ActivityLog(Base, UUIDPKMixin):
    __tablename__ = "activity_logs"

    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    action_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    details: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(64), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default="now()", nullable=False, index=True
    )
