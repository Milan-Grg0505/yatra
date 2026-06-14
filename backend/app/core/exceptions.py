"""
Domain exceptions and FastAPI error handlers.

Throw one of the `AppException` subclasses anywhere in the code; the handler
turns it into a JSON envelope `{success: false, message, code, errors?}` so the
frontend can render meaningful errors.
"""

from __future__ import annotations

from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.core.logging import get_logger

logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# Exception hierarchy
# ---------------------------------------------------------------------------
class AppException(Exception):
    status_code: int = 500
    code: str = "internal_error"
    message: str = "Something went wrong"

    def __init__(
        self,
        message: str | None = None,
        *,
        code: str | None = None,
        details: dict[str, Any] | None = None,
    ) -> None:
        self.message = message or self.message
        self.code = code or self.code
        self.details = details or {}
        super().__init__(self.message)


class BadRequest(AppException):
    status_code = status.HTTP_400_BAD_REQUEST
    code = "bad_request"
    message = "Invalid request"


class Unauthorized(AppException):
    status_code = status.HTTP_401_UNAUTHORIZED
    code = "unauthorized"
    message = "Not authenticated"


class Forbidden(AppException):
    status_code = status.HTTP_403_FORBIDDEN
    code = "forbidden"
    message = "Not allowed"


class NotFound(AppException):
    status_code = status.HTTP_404_NOT_FOUND
    code = "not_found"
    message = "Resource not found"


class Conflict(AppException):
    status_code = status.HTTP_409_CONFLICT
    code = "conflict"
    message = "Conflict with existing state"


class UnprocessableEntity(AppException):
    status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    code = "unprocessable_entity"
    message = "Could not process request"


class TooManyRequests(AppException):
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    code = "too_many_requests"
    message = "Rate limit exceeded"


class ExternalServiceError(AppException):
    status_code = status.HTTP_502_BAD_GATEWAY
    code = "external_service_error"
    message = "Upstream service failed"


# ---------------------------------------------------------------------------
# Standard envelope
# ---------------------------------------------------------------------------
def _envelope(
    *,
    success: bool,
    message: str,
    code: str | None = None,
    errors: Any | None = None,
    data: Any | None = None,
    meta: dict[str, Any] | None = None,
) -> dict[str, Any]:
    body: dict[str, Any] = {"success": success, "message": message}
    if code:
        body["code"] = code
    if errors is not None:
        body["errors"] = errors
    if data is not None:
        body["data"] = data
    if meta is not None:
        body["meta"] = meta
    return body


# ---------------------------------------------------------------------------
# Handlers
# ---------------------------------------------------------------------------
def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def app_exception_handler(_: Request, exc: AppException) -> JSONResponse:
        logger.warning("app_exception", code=exc.code, message=exc.message)
        return JSONResponse(
            status_code=exc.status_code,
            content=_envelope(
                success=False,
                message=exc.message,
                code=exc.code,
                errors=exc.details or None,
            ),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        _: Request, exc: RequestValidationError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=_envelope(
                success=False,
                message="Validation failed",
                code="validation_error",
                errors=jsonable_encoder(exc.errors()),
            ),
        )

    @app.exception_handler(IntegrityError)
    async def integrity_handler(_: Request, exc: IntegrityError) -> JSONResponse:
        logger.warning("integrity_error", error=str(exc.orig))
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content=_envelope(
                success=False,
                message="Conflicts with existing data",
                code="integrity_error",
            ),
        )

    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_handler(_: Request, exc: SQLAlchemyError) -> JSONResponse:
        logger.error("database_error", error=str(exc))
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=_envelope(success=False, message="Database error", code="db_error"),
        )

    @app.exception_handler(Exception)
    async def fallback_handler(_: Request, exc: Exception) -> JSONResponse:
        logger.exception("unhandled_exception", error=str(exc))
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=_envelope(
                success=False, message="Internal server error", code="internal_error"
            ),
        )
