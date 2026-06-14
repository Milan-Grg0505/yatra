from __future__ import annotations

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field

from app.models.enums import OtpType, Role
from app.schemas._shared import ORMModel


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    phone: str | None = Field(default=None, pattern=r"^\d{10,15}$")
    address: str | None = Field(default=None, max_length=255)
    role: Literal["user", "owner"] = "user"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserPublic(ORMModel):
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
    created_at: datetime | None = None
    updated_at: datetime | None = None


class LoginResponse(BaseModel):
    user: UserPublic
    token: str = Field(description="Access token")
    refresh_token: str
    token_type: str = "bearer"


class TokenPair(BaseModel):
    token: str
    refresh_tokens: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class SendOtpRequest(BaseModel):
    email: EmailStr
    type: OtpType
    new_email: EmailStr | None = None


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")
    type: OtpType


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")
    new_password: str = Field(min_length=8)


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(min_length=8)
