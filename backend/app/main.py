from app.api.deps import limiter
from sqlalchemy import text
from app.core.database import dispose_engine
from app.core.logging import get_logger, configure_logging
from typing import AsyncIterator
from contextlib import asynccontextmanager
from fastapi import FastAPI
from sqlalchemy.ext.asyncio import create_async_engine
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app import __version__
from app.core.config import settings
from app.api.v1 import api_router
from app.core.exceptions import register_exception_handlers

engine = create_async_engine(settings.DATABASE_URL)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    configure_logging()
    log = get_logger("startup")
    log.info("app_starting", version=app.version, env=settings.APP_ENV)
    # ✅ Add database connection test
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            log.info("database_connected", url=settings.DATABASE_URL.split("@")[-1])
    except Exception as e:
        log.error("database_connection_failed", error=str(e))

    # Add Redis connection test (if using Redis)
    if settings.REDIS_URL:
        try:
            # pyrefly: ignore [missing-import]
            import redis.asyncio as redis

            r = redis.from_url(settings.REDIS_URL)
            await r.ping()
            log.info("redis_connected")
            await r.close()
        except Exception as e:
            log.warning("redis_connection_failed", error=str(e))
    yield
    await dispose_engine()
    log.info("app_stopped")


def create_app() -> FastAPI:
    app = FastAPI(
        title="Yatra API",
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )
    # --- Middleware ---
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5174",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["x-request-id"],
    )

    app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

    # -----Router---
    app.include_router(api_router, prefix=settings.API_V1_PREFIX)

    # --- State ---
    app.state.limiter = limiter

    # --- Exception handlers ---
    register_exception_handlers(app)

    @app.get("/", tags=["health"])
    async def root() -> dict:
        return {"name": settings.APP_NAME, "version": __version__, "status": "ok"}

    @app.get("/api/health", tags=["health"])
    async def health() -> dict:
        return {"success": True, "message": "ok", "version": __version__}

    return app


app = create_app()
