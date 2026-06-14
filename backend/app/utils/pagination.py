"""Generic pagination helper for SQLAlchemy queries."""

from __future__ import annotations

import re
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.responses import PaginationMeta


async def paginate(
    db: AsyncSession,
    stmt: Any,
    *,
    page: int = 1,
    limit: int = 20,
) -> tuple[list[Any], PaginationMeta]:
    """Run COUNT + paginated SELECT and return (rows, meta)."""

    page = max(1, page)
    limit = max(1, min(100, limit))

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total = (await db.execute(count_stmt)).scalar_one()

    rows = (
        (await db.execute(stmt.offset((page - 1) * limit).limit(limit))).scalars().all()
    )

    return list(rows), PaginationMeta.build(page=page, limit=limit, total=total)


_SLUG_RE = re.compile(r"[^\w\s-]")
_DASH_RE = re.compile(r"[-\s]+")


def slugify(text: str) -> str:
    text = _SLUG_RE.sub("", text.lower().strip())
    return _DASH_RE.sub("-", text)
