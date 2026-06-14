"""Review schemas."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import ReviewStatus, Sentiment
from app.schemas._shared import ORMModel


class ReviewCreate(BaseModel):
    hotel_id: uuid.UUID
    booking_id: uuid.UUID
    rating: float = Field(ge=1, le=5)
    title: str = Field(min_length=3, max_length=120)
    comment: str = Field(min_length=10, max_length=2000)


class ReviewUpdate(BaseModel):
    rating: float | None = None
    title: str | None = None
    comment: str | None = None


class ReviewOut(ORMModel):
    id: uuid.UUID
    user_id: uuid.UUID
    hotel_id: uuid.UUID
    booking_id: uuid.UUID
    rating: float
    title: str
    comment: str
    images: list[str]
    helpful_count: int
    owner_response: str | None = None
    owner_response_date: datetime | None = None
    status: ReviewStatus
    sentiment: Sentiment | None = None
    sentiment_score: float | None = None
    topics: list[str]
    created_at: datetime


class ReviewRespond(BaseModel):
    response: str = Field(min_length=2, max_length=2000)


class ReviewStatusUpdate(BaseModel):
    status: ReviewStatus
