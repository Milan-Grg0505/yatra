"""Hero, blog, notification, chat schemas."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import NotificationType
from app.schemas._shared import ORMModel


class HeroIn(BaseModel):
    title: str
    sub_title: str
    description: str
    link: str | None = None
    order: int = 0
    active: bool = True


class HeroOut(ORMModel):
    id: uuid.UUID
    image: str
    title: str
    sub_title: str
    description: str
    link: str | None = None
    order: int
    active: bool


class BlogIn(BaseModel):
    title: str = Field(min_length=3)
    description: str = Field(min_length=10)
    content: str | None = None
    tags: list[str] = []
    published: bool = True


class BlogOut(ORMModel):
    id: uuid.UUID
    title: str
    slug: str
    image: str
    description: str
    content: str | None = None
    tags: list[str]
    author_id: uuid.UUID | None = None
    view_count: int
    published: bool
    created_at: datetime


class NotificationOut(ORMModel):
    id: uuid.UUID
    type: NotificationType
    title: str
    message: str
    link: str | None = None
    read: bool
    read_at: datetime | None = None
    created_at: datetime


class ChatMessageIn(BaseModel):
    message: str
    session_id: str | None = None


class ChatMessageOut(BaseModel):
    session_id: str
    response: str
    intent: str | None = None


class ChatMessage(BaseModel):
    role: str
    content: str
    intent: str | None = None
    created_at: datetime | None = None


class ChatSessionSummary(BaseModel):
    id: uuid.UUID = Field(alias="_id")
    last_message: str | None = None
    last_response: str | None = None
    last_at: datetime | None = None
    turns: int


# --- Coupons --------------------------------------------------------------
class CouponIn(BaseModel):
    code: str
    description: str | None = None
    discount_type: str
    discount_value: float
    min_booking_amount: float = 0.0
    max_discount_amount: float | None = None
    valid_from: datetime
    valid_until: datetime
    usage_limit: int | None = None
    applicable_hotels: list[uuid.UUID] = []
    active: bool = True


class CouponOut(ORMModel):
    id: uuid.UUID
    code: str
    description: str | None = None
    discount_type: str
    discount_value: float
    min_booking_amount: float
    max_discount_amount: float | None = None
    valid_from: datetime
    valid_until: datetime
    usage_limit: int | None = None
    used_count: int
    active: bool
