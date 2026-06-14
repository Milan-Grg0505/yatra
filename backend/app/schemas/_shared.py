"""Shared Pydantic base config & helpers."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    """Base for any schema mapped from SQLAlchemy models."""

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        arbitrary_types_allowed=True,
    )


T = TypeVar("T")


class Paginated(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    limit: int
    pages: int


class IdRef(BaseModel):
    id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)


class TimestampedMixin(BaseModel):
    created_at: datetime
    updated_at: datetime


def serialize_uuid(value: Any) -> str:
    return str(value) if value is not None else None  # type: ignore[return-value]
