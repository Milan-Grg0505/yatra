"""Domain enums — referenced by SQLAlchemy models and Pydantic schemas."""

import enum


class Role(str, enum.Enum):
    user = "user"
    owner = "owner"
    admin = "admin"


class HotelType(str, enum.Enum):
    resort = "resort"
    hostel = "hostel"
    hotel = "hotel"
    homestay = "homestay"
    other = "other"


class HotelStatus(str, enum.Enum):
    approved = "approved"
    pending = "pending"
    rejected = "rejected"


class BookingStatus(str, enum.Enum):
    confirmed = "confirmed"
    pending = "pending"
    canceled = "canceled"
    completed = "completed"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    refunded = "refunded"
    failed = "failed"


class PaymentMethod(str, enum.Enum):
    esewa = "esewa"
    khalti = "khalti"
    cash = "cash"


class ReviewStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class CancellationPolicy(str, enum.Enum):
    free = "free"
    flexible = "flexible"
    moderate = "moderate"
    strict = "strict"


class ViewType(str, enum.Enum):
    city = "city"
    mountain = "mountain"
    garden = "garden"
    pool = "pool"
    ocean = "ocean"
    none = "none"


class RoomType(str, enum.Enum):
    single = "single"
    double = "double"
    suite = "suite"
    deluxe = "deluxe"
    family = "family"
    other = "other"


class BedType(str, enum.Enum):
    single = "single"
    double = "double"
    queen = "queen"
    king = "king"
    bunk = "bunk"
    sofa = "sofa"
    other = "other"


class SmokingPolicy(str, enum.Enum):
    smoking = "smoking"
    non_smoking = "non-smoking"
    both = "both"


class TravelStyle(str, enum.Enum):
    luxury = "luxury"
    budget = "budget"
    adventure = "adventure"
    family = "family"
    business = "business"
    solo = "solo"


class DifficultyLevel(str, enum.Enum):
    easy = "easy"
    moderate = "moderate"
    challenging = "challenging"


class TravelPackageStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    upcoming = "upcoming"


class TravelBookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    completed = "completed"
    cancelled = "cancelled"


class OtpType(str, enum.Enum):
    verification = "verification"
    password_reset = "password_reset"
    email_change = "email_change"


class NotificationType(str, enum.Enum):
    booking_confirmed = "booking_confirmed"
    booking_canceled = "booking_canceled"
    review_response = "review_response"
    review_approved = "review_approved"
    payment_success = "payment_success"
    payment_failed = "payment_failed"
    hotel_approved = "hotel_approved"
    hotel_rejected = "hotel_rejected"
    hotel_registered = "hotel_registered"
    travel_booking = "travel_booking"
    system = "system"


class Sentiment(str, enum.Enum):
    positive = "positive"
    negative = "negative"
    neutral = "neutral"


class DiscountType(str, enum.Enum):
    percentage = "percentage"
    fixed = "fixed"


class Gender(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"
