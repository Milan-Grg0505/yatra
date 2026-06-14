"""
Async SQLAlchemy 2.0 database setup.

Exports:
- `engine`         : the singleton async engine
- `AsyncSessionLocal`: session factory; use with `async with` blocks
- `get_db`         : FastAPI dependency that yields a session
- `Base`           : declarative base for all ORM models
"""

from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from typing import Any

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase, declared_attr

from app.core.config import settings


# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------
def _create_engine() -> AsyncEngine:
    return create_async_engine(
        settings.DATABASE_URL,  # Your PostgreSQL connection string
        echo=False,  # Don't log SQL queries (set True for debugging)
        future=True,  # Use SQLAlchemy 2.0 style
        pool_pre_ping=True,  # Test connection before using (prevents stale connections)
        pool_size=settings.DB_POOL_SIZE,  # 10 permanent connections
        max_overflow=settings.DB_MAX_OVERFLOW,  # +20 temporary if needed
        pool_recycle=settings.DB_POOL_RECYCLE,  # Refresh connections every 3600 seconds
    )


engine: AsyncEngine = _create_engine()

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Objects remain usable after commit
    autoflush=False,  # Objects remain usable after commit
)


# ---------------------------------------------------------------------------
# Declarative base
# ---------------------------------------------------------------------------
class Base(DeclarativeBase):
    """Shared declarative base for every ORM model in the app."""

    # Auto-derive __tablename__ from class name (CamelCase → snake_case + plural-ish)
    @declared_attr.directive
    def __tablename__(cls) -> str:  # noqa: N805
        # Converts "UserProfile" → "user_profiles"
        # Converts "HotelRoom" → "hotel_rooms"
        name = cls.__name__
        out = [name[0].lower()]
        for ch in name[1:]:
            if ch.isupper():
                out.append("_")
                out.append(ch.lower())
            else:
                out.append(ch)
        return "".join(out) + "s"  # Adds 's' at the end for plural

    def to_dict(self) -> dict[str, Any]:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


# ---------------------------------------------------------------------------
# Session dependency
# ---------------------------------------------------------------------------
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency: yields a session that auto-rolls-back on exceptions
    and commits successful unit-of-work blocks via the caller.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        # commit is the caller's responsibility (route handler)


@asynccontextmanager
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """For background tasks / scripts where we're not in a request scope."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()  # Auto-commits on success
        except Exception:
            await session.rollback()
            raise


async def dispose_engine() -> None:
    await engine.dispose()
