"""Geographic data: cities, generic geocoded points."""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Float, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models._mixins import TimestampMixin, UUIDPKMixin

if TYPE_CHECKING:
    from app.models.hotel import Hotel


class City(Base, UUIDPKMixin, TimestampMixin):
    __tablename__ = "cities"

    name: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False, index=True
    )
    country: Mapped[str] = mapped_column(
        String(80), default="Nepal", server_default="Nepal", nullable=False
    )
    image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    image_public_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)

    hotels: Mapped[list["Hotel"]] = relationship(
        "Hotel", back_populates="city", lazy="select"
    )


class Location(Base, UUIDPKMixin, TimestampMixin):
    """Generic geocoded place (landmark, attraction, transit stop)."""

    __tablename__ = "locations"

    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(60), nullable=False, index=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    city_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True, index=True
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
