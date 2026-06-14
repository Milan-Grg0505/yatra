"""ORM models — import once at app startup so SQLAlchemy can resolve relationships."""

from app.core.database import Base
from app.models.user import User, Otp, RefreshToken, ActivityLog
from app.models.location import City, Location
from app.models.hotel import (
    Hotel,
    Facility,
    Service,
    Policy,
    Photo,
    hotel_facilities,
    room_services,
)
from app.models.room import Room
from app.models.booking import Booking, Transaction, Coupon
from app.models.review import Review
from app.models.travel import TravelPackage, TravelBooking
from app.models.content import ChatSession, Notification, Hero, Blog

__all__ = [
    "Base",
    "User",
    "Otp",
    "RefreshToken",
    "ActivityLog",
    "City",
    "Location",
    "Hotel",
    "Facility",
    "Service",
    "Policy",
    "Photo",
    "hotel_facilities",
    "room_services",
    "Room",
    "Booking",
    "Transaction",
    "Coupon",
    "Review",
    "TravelPackage",
    "TravelBooking",
    "ChatSession",
    "Notification",
    "Hero",
    "Blog",
]
