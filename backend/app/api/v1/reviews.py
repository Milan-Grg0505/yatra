"""Review CRUD + owner response + admin moderation. Sentiment analysed async."""

from __future__ import annotations
from fastapi import APIRouter, BackgroundTasks, Query, UploadFile, status

import asyncio
import uuid
from datetime import datetime, timezone
from typing import Any
from sqlalchemy import select

from app.api.deps import AdminUser, CurrentUser, DbDep
from app.core.exceptions import BadRequest, Forbidden, NotFound
from app.core.responses import ok
from app.models.booking import Booking
from app.models.enums import (
    BookingStatus,
    NotificationType,
    ReviewStatus,
    Role,
    Sentiment,
)
from app.models.hotel import Hotel
from app.models.review import Review
from app.schemas.review import (
    ReviewCreate,
    ReviewOut,
    ReviewRespond,
    ReviewStatusUpdate,
)
from app.services import notification_service

# from app.services.ai import sentiment as sentiment_svc
from app.utils.cloudinary_util import upload_image

router = APIRouter(prefix="/reviwes", tags=["reviews"])


def _ser(r: Review) -> dict[str, Any]:
    return ReviewOut.model_validate(r).model_dump(mode="json")


# ---------------------------------------------------------------------------
# Background: analyse sentiment for a review
# ---------------------------------------------------------------------------
# async def _analyze_and_save_sentiment(review_id: uuid.UUID) -> None:
#     from app.core.database import db_session
#     async with db_session() as db:
#         review = (await db.execute(select(Review).where(Review.id == review_id))).scalar_one_or_none()
#         if not review:
#             return
#         result = await sentiment_svc.analyze(f"{review.title}\n{review.comment}")
#         review.sentiment = Sentiment(result.sentiment)
#         review.sentiment_score = result.score
#         review.topics = result.topics or []


@router.get("/hotel/{hotel_id}")
async def for_hotel(
    hotel_id: uuid.UUID,
    db: DbDep,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
) -> dict[str, Any]:
    stmt = (
        select(Review)
        .where(Review.hotel_id == hotel_id, Review.status == ReviewStatus.approved)
        .order_by(Review.created_at.desc())
        .offset((page - 1) * limit)
        .limit(1)
    )

    rows = (await db.execute(stmt)).scalars().all()
    return ok([_ser(r) for r in rows])


@router.get("/user/my")
async def my_reviews(me: CurrentUser, db: DbDep) -> dict[str, Any]:
    rows = (
        (
            await db.execute(
                select(Review)
                .where(Review.user_id == me.id)
                .order_by(Review.created_at.desc())
            )
        )
        .scalars()
        .all()
    )
    return ok([_ser(r) for r in rows])


@router.post("/add", status_code=status.HTTP_201_CREATED)
async def create_review(
    body: ReviewCreate,
    me: CurrentUser,
    db: DbDep,
    background: BackgroundTasks,
    images: list[UploadFile] = [],
) -> dict[str, Any]:
    booking = (
        await db.execute(select(Booking).where(Booking.id == body.booking_id))
    ).scalar_one_or_none()
    if not booking or booking.user_id != me.id:
        raise BadRequest("Invalid booking for this user")
    if booking.status not in {BookingStatus.completed, BookingStatus.confirmed}:
        raise BadRequest("You can only review completed or confirmed bookings")

    review = Review(
        user_id=me.id,
        hotel_id=body.hotel_id,
        booking_id=body.booking_id,
        rating=body.rating,
        title=body.title,
        comment=body.comment,
        status=ReviewStatus.pending,
    )

    if images:
        urls: list[str] = []
        for img in images:
            data = await img.read()
            if not data:
                continue
            uploaded = await upload_image(data, folder=f"yatra/reviews/{body.hotel_id}")
            urls.append(uploaded["url"])
        review.images = urls

    db.add(review)
    await db.flush()

    # Kick off sentiment analysis without blocking the response
    # background.add_task(asyncio.create_task, _analyze_and_save_sentiment(review.id))

    # return ok(_ser(review))


@router.put("/edit/{review_id}")
async def update_review(
    review_id: uuid.UUID, body: dict, me: CurrentUser, db: DbDep
) -> dict[str, Any]:
    review = (
        await db.execute(select(Review).where(Review.id == review_id))
    ).scalar_one_or_none()
    if not review or review.user_id != me.id:
        raise NotFound("Review not found")
    for k, v in body.items():
        if k in {"rating", "title", "comment"}:
            setattr(review, k, v)
    await db.commit()
    return ok(_ser(review))


@router.delete("/delete/{review_id}")
async def delete_review(
    review_id: uuid.UUID, me: CurrentUser, db: DbDep
) -> dict[str, Any]:
    review = (
        await db.execute(select(Review).where(Review.id == review_id))
    ).scalar_one_or_none()
    if not review:
        raise NotFound("Review not found")
    if me.role != Role.admin and review.user_id != me.id:
        raise Forbidden("Not your review")
    await db.delete(review)
    await db.commit()
    return ok(message="Deleted")


# Community validation of review quality
@router.post("/{review_id}/helpful")
async def mark_helpful(
    review_id: uuid.UUID, me: CurrentUser, db: DbDep
) -> dict[str, Any]:
    review = (
        await db.execute(select(Review).where(Review.id == review_id))
    ).scalar_one_or_none()
    if not review:
        raise NotFound("Review not Found")
    helpful = list(review.helpful_by or [])
    if me.id in helpful:
        helpful.remove(me.id)
    else:
        helpful.append(me.id)
    review.helpful_by = helpful
    review.helpful_count = len(helpful)
    await db.commit()
    return ok({"helpful_count": review.helpful_count})


#  Hotel owners can publicly respond to guest reviews
@router.post("/{review_id}/respond")
async def respond(
    review_id: uuid.UUID, body: ReviewRespond, me: CurrentUser, db: DbDep
) -> dict[str, Any]:
    review = (
        await db.execute(select(Review).where(Review.id == review_id))
    ).scalar_one_or_none()
    if not review:
        raise NotFound("Review not found")
    hotel = (
        await db.execute(select(Hotel).where(Hotel.id == review.hotel_id))
    ).scalar_one_or_none()
    if not hotel or (me.role != Role.admin and hotel.owner_id != me.id):
        raise Forbidden("Only the hotel owner can respond")
    review.owner_response = body.response
    review.owner_response_date = datetime.now(tz=timezone.utc)
    await notification_service.create(
        db,
        user_id=review.user_id,
        type=NotificationType.review_response,
        title="The hotel responded to your review",
        message=body.response[:200],
    )
    await db.commit()
    return ok(_ser(review))


# Admin moderation of reviews before publishing
@router.put("/{review_id}/status")
async def set_review_status(
    review_id: uuid.UUID, body: ReviewStatusUpdate, _: AdminUser, db: DbDep
) -> dict[str, Any]:
    review = (
        await db.execute(select(Review).where(Review.id == review_id))
    ).scalar_one_or_none()
    if not review:
        raise NotFound("Review not found")
    review.status = body.status
    if body.status == ReviewStatus.approved:
        await notification_service.create(
            db,
            user_id=review.user_id,
            type=NotificationType.review_approved,
            title="Your review is live",
            message="Thanks for sharing your experience!",
        )
    await db.commit()
    return ok(_ser(review))
