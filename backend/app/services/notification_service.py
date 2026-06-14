import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.content import Notification


async def create(
    db: AsyncSession,
    *,
    user_id: uuid.UUID,
    title: str,
    message: str,
    link: str | None = None,
    metadata: dict | None = None,
) -> Notification:
    notif = Notification(
        user_id=user_id,
        type=type,
        title=title,
        message=message,
        link=link,
        metadata_=metadata,
    )
    db.add(notif)
    await db.flush()
    return notif
