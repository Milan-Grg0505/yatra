"""Room inventory for a hotel."""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ARRAY, Boolean, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models._mixins import TimestampMixin, UUIDPKMixin
from app.models.enums import BedType, RoomType, SmokingPolicy, ViewType
from app.models.hotel import room_services

if TYPE_CHECKING:
    from app.models.hotel import Hotel, Service


class Room(Base, UUIDPKMixin, TimestampMixin):
    __tablename__ = "rooms"

    hotel_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("hotels.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    room_type: Mapped[RoomType] = mapped_column(
        Enum(RoomType, name="room_type"), default=RoomType.double, nullable=False
    )
    room_name: Mapped[str] = mapped_column(String(120), nullable=False)
    number_of_rooms: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    bed_type: Mapped[BedType] = mapped_column(
        Enum(BedType, name="bed_type"), default=BedType.double, nullable=False
    )
    number_of_beds: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    smoking_policy: Mapped[SmokingPolicy] = mapped_column(
        Enum(SmokingPolicy, name="smoking_policy"),
        default=SmokingPolicy.non_smoking,
        nullable=False,
    )

    base_price: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    max_guest: Mapped[int] = mapped_column(Integer, default=2, nullable=False)
    room_size: Mapped[str | None] = mapped_column(String(40), nullable=True)

    discount_percentage: Mapped[float] = mapped_column(
        Float, default=0.0, nullable=False
    )
    weekend_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    festival_price: Mapped[float | None] = mapped_column(Float, nullable=True)

    images: Mapped[list[str]] = mapped_column(
        ARRAY(String), default=list, nullable=False
    )
    amenities: Mapped[list[str]] = mapped_column(
        ARRAY(String), default=list, nullable=False
    )

    view_type: Mapped[ViewType] = mapped_column(
        Enum(ViewType, name="view_type"), default=ViewType.none, nullable=False
    )
    floor_number: Mapped[int | None] = mapped_column(Integer, nullable=True)

    has_ac: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    has_wifi: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    has_tv: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    has_minibar: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    has_safe: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    hotel: Mapped["Hotel"] = relationship("Hotel", back_populates="rooms")
    services: Mapped[list["Service"]] = relationship(
        "Service", secondary=room_services, lazy="selectin"
    )
