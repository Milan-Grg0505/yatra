"""Schemas for AI endpoints — trip planner, voice bot, vision, sentiment."""

from __future__ import annotations

import uuid
from datetime import date as Date

from pydantic import BaseModel, Field

from app.models.enums import DifficultyLevel, TravelStyle


# ============================================================================
# Trip planner
# ============================================================================
class TripPlannerRequest(BaseModel):
    """Input to the trip planner.

    Either provide free-text `description` or structured fields (or both).
    The planner combines them when calling the LLM.
    """

    description: str | None = Field(
        default=None,
        description="Free-form trip description, e.g. 'family trip to Nepal for 10 days'",
    )
    duration_days: int | None = Field(default=None, ge=1, le=60)
    start_date: Date | None = None
    budget: float | None = Field(default=None, ge=0)
    currency: str = "NPR"
    travel_style: list[TravelStyle] = []
    interests: list[str] = []
    starting_city: str | None = None
    num_travelers: int = Field(default=2, ge=1, le=20)


class TripStop(BaseModel):
    city: str
    nights: int
    why: str
    activities: list[str] = []
    suggested_hotel_ids: list[uuid.UUID] = []
    estimated_cost: float | None = None


class TripDay(BaseModel):
    day: int
    date: Date | None = None
    title: str
    description: str
    city: str | None = None
    activities: list[str] = []


class TripPlanResponse(BaseModel):
    summary: str
    total_days: int
    total_nights: int
    estimated_budget: float | None = None
    currency: str = "NPR"
    best_season: str | None = None
    difficulty: DifficultyLevel | None = None
    stops: list[TripStop]
    itinerary: list[TripDay]
    tips: list[str] = []
    warnings: list[str] = []


# ============================================================================
# Voice bot
# ============================================================================
class VoiceCallRequest(BaseModel):
    """Twilio webhook payload (subset we care about). Twilio sends form-encoded;
    we accept a normalized version here."""

    call_sid: str
    from_number: str
    to_number: str
    speech_result: str | None = None  # what the caller said (Twilio Gather)
    digits: str | None = None  # DTMF input


class VoiceTwiMLResponse(BaseModel):
    """We actually return XML strings to Twilio, but expose this for the JSON
    test endpoint."""

    say: str
    next_action: str | None = None
    hangup: bool = False


class VoiceTranscribeRequest(BaseModel):
    audio_url: str | None = None
    language: str = "en"


class VoiceTranscribeResponse(BaseModel):
    text: str
    language: str
    duration: float | None = None


# ============================================================================
# Vision (image analysis)
# ============================================================================
class VisionAnalyzeRequest(BaseModel):
    """Pass either a URL or a Cloudinary public_id. The analyzer picks the
    cheapest provider for the requested feature."""

    image_url: str | None = None
    public_id: str | None = None
    hotel_id: uuid.UUID | None = None
    features: list[str] = Field(
        default_factory=lambda: ["tags", "quality", "moderation", "landmarks"],
        description="Subset of: tags, quality, moderation, landmarks, room_type, ocr",
    )


class VisionTag(BaseModel):
    name: str
    confidence: float


class VisionLandmark(BaseModel):
    name: str
    confidence: float
    latitude: float | None = None
    longitude: float | None = None


class VisionModeration(BaseModel):
    safe: bool
    adult: float = 0.0
    violence: float = 0.0
    racy: float = 0.0
    reasons: list[str] = []


class VisionQuality(BaseModel):
    score: float  # 0–100
    is_blurry: bool
    is_too_dark: bool
    is_too_bright: bool
    width: int | None = None
    height: int | None = None
    notes: list[str] = []


class VisionAnalyzeResponse(BaseModel):
    image_url: str
    tags: list[VisionTag] = []
    detected_amenities: list[str] = []
    room_type: str | None = None
    landmarks: list[VisionLandmark] = []
    moderation: VisionModeration | None = None
    quality: VisionQuality | None = None
    text_in_image: str | None = None
    providers: list[str] = []  # which services contributed


# ============================================================================
# Sentiment / NLP utility
# ============================================================================
class SentimentRequest(BaseModel):
    text: str = Field(min_length=1, max_length=4000)


class SentimentResponse(BaseModel):
    sentiment: str
    score: float
    topics: list[str] = []


# ============================================================================
# Recommendations
# ============================================================================
class RecommendationRequest(BaseModel):
    limit: int = 12


class TrendingDestination(BaseModel):
    city_id: uuid.UUID
    city: str
    image: str | None = None
    score: float
