"""Pydantic schemas — request/response models."""

from app.schemas._shared import ORMModel, Paginated, IdRef
from app.schemas import auth, user, hotel, room, booking, review, travel, content, ai

__all__ = [
    "ORMModel",
    "Paginated",
    "IdRef",
    "auth",
    "user",
    "hotel",
    "room",
    "booking",
    "review",
    "travel",
    "content",
    "ai",
]
