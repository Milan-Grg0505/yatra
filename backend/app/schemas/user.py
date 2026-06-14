"""User profile schemas."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.enums import Role, TravelStyle
from app.schemas._shared import ORMModel


class UserOut(ORMModel):
    id: uuid.UUID
    name: str
    email: EmailStr
    phone: str | None = None
    address: str | None = None
    image: str | None = None
    role: Role
    is_email_verified: bool
    is_approved: bool | None = None
    preferences: dict
    travel_style: list[str]
    wishlist: list[uuid.UUID] = []
    favorite_hotels: list[uuid.UUID] = []
    created_at: datetime | None = None
    updated_at: datetime | None = None


class ProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    phone: str | None = Field(default=None, pattern=r"^\d{10,15}$")
    address: str | None = Field(default=None, max_length=255)


class PreferencesUpdate(BaseModel):
    theme: str | None = None
    language: str | None = None
    currency: str | None = None
    notifications: bool | None = None
    travel_style: list[TravelStyle] | None = None


class AdminCreateUser(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8)
    phone: str | None = None
    role: Role = Role.user


class AdminUpdateUser(BaseModel):
    name: str | None = None
    phone: str | None = None
    role: Role | None = None
    is_email_verified: bool | None = None
    is_approved: bool | None = None
