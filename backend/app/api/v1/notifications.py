"""User-facing notification listing."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Query
from sqlalchemy import func, select

from app.api.deps import CurrentUser, DbDep
from app.core.exceptions import NotFound
from app.core.responses import ok, PaginationMeta
from app.models.content import Notification
from app.schemas.content import NotificationOut

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
async def list_notifications(
    me: CurrentUser,
    db: DbDep,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    unread: bool = Query(False),
) -> dict[str, Any]:
    base = select(Notification).where(Notification.user_id == me.id)
    if unread:
        base = base.where(Notification.read == False)  # noqa: E712

    total = (
        await db.execute(select(func.count()).select_from(base.subquery()))
    ).scalar_one()
    unread_count = (
        await db.execute(
            select(func.count(Notification.id)).where(
                Notification.user_id == me.id, Notification.read == False  # noqa: E712
            )
        )
    ).scalar_one()

    rows = (
        (
            await db.execute(
                base.order_by(Notification.created_at.desc())
                .offset((page - 1) * limit)
                .limit(limit)
            )
        )
        .scalars()
        .all()
    )
    meta = PaginationMeta.build(page=page, limit=limit, total=total)
    meta.unread = int(unread_count)
    data = [NotificationOut.model_validate(n).model_dump(mode="json") for n in rows]
    return ok(data, meta=meta)


@router.put("/{notification_id}/read")
async def mark_read(
    notification_id: uuid.UUID, me: CurrentUser, db: DbDep
) -> dict[str, Any]:
    n = (
        await db.execute(select(Notification).where(Notification.id == notification_id))
    ).scalar_one_or_none()
    if not n or n.user_id != me.id:
        raise NotFound("Notificaiton not found")
    if not n.read:
        n.read = True
        n.read_at = datetime.now(tz=timezone.utc)
        await db.commit()
    return ok(message="Marked read")


@router.put("/read-all")
async def mark_all_read(me: CurrentUser, db: DbDep) -> dict[str, Any]:
    rows = (
        (
            await db.execute(
                select(Notification).where(
                    Notification.user_id == me.id,
                    Notification.read == False,  # noqa: E712
                )
            )
        )
        .scalars()
        .all()
    )
    now = datetime.now(tz=timezone.utc)
    for n in rows:
        n.read = True
        n.read_at = now
    await db.commit()
    return ok(message="All marked read")
