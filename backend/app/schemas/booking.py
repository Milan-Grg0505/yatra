"""Booking & payment schemas."""

from __future__ import annotations

import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field, model_validator

from app.models.enums import BookingStatus, Gender, PaymentMethod, PaymentStatus
from app.schemas._shared import ORMModel


class GuestDetail(BaseModel):
    full_name: str
    age: int | None = None
    gender: Gender | None = None


class BookingCreate(BaseModel):
    hotel_id: uuid.UUID
    room_id: uuid.UUID | None = None
    check_in: date
    check_out: date
    num: int = Field(ge=1, default=1)
    guest_count: int = Field(ge=1, default=1)
    special_requests: str | None = None
    guest_details: list[GuestDetail] = []
    coupon_code: str | None = None
    payment_method: PaymentMethod = PaymentMethod.esewa

    @model_validator(mode="after")
    def _check_dates(self) -> "BookingCreate":
        if self.check_out <= self.check_in:
            raise ValueError("check_out must be after check_in")
        return self


class BookingCancelRequest(BaseModel):
    reason: str | None = None


class AvailabilityRequest(BaseModel):
    hotel_id: uuid.UUID
    room_id: uuid.UUID | None = None
    check_in: date
    check_out: date
    num: int = 1


class AvailabilityResponse(BaseModel):
    available: bool
    total: int
    used: int


class PaymentInitiateRequest(BaseModel):
    booking_id: uuid.UUID
    payment_method: PaymentMethod


class PaymentInitiateResponse(BaseModel):
    provider: PaymentMethod
    form: dict | None = None
    pidx: str | None = None
    payment_url: str | None = None
    transaction_uuid: str | None = None


class PaymentStatusUpdate(BaseModel):
    transaction_uuid: str
    status: str | None = None
    ref_id: str | None = None


class BookingOut(ORMModel):
    id: uuid.UUID
    user_id: uuid.UUID
    hotel_id: uuid.UUID
    room_id: uuid.UUID | None = None
    check_in: date
    check_out: date
    num: int
    guest_count: int
    status: BookingStatus
    payment_status: PaymentStatus
    payment_method: PaymentMethod | None = None
    payment_id: str | None = None
    base_price: float
    tax_amount: float
    service_charge: float
    discount_amount: float
    total_price: float
    coupon_code: str | None = None
    special_requests: str | None = None
    guest_details: list[dict] | None = None
    cancelled_at: datetime | None = None
    cancellation_reason: str | None = None
    created_at: datetime
