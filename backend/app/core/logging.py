"""Structured logging configured once at app startup."""

from __future__ import annotations

import logging
import sys

# pyrefly: ignore [missing-import]
import structlog

from app.core.config import settings


def configure_logging() -> None:
    """Install structlog as the global logger; route std-lib logs through it."""

    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, settings.LOG_LEVEL, logging.INFO),
    )

    shared_processors: list = [
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso", utc=True),
        structlog.processors.StackInfoRenderer(),
    ]

    if settings.is_production:
        # JSON in prod for log aggregators
        processors = shared_processors + [structlog.processors.JSONRenderer()]
    else:
        # Pretty key-value coloured output for humans
        processors = shared_processors + [
            structlog.dev.ConsoleRenderer(colors=True),
        ]

    structlog.configure(
        processors=processors,
        wrapper_class=structlog.make_filtering_bound_logger(
            getattr(logging, settings.LOG_LEVEL, logging.INFO)
        ),
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )


def get_logger(name: str | None = None) -> structlog.stdlib.BoundLogger:
    return structlog.get_logger(name)
