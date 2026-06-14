"""
Authentication primitives: password hashing + JWT issue/verify.

We use PyJWT directly (not python-jose, which has had years of stale releases
and CVEs). Token shape:

    access:  {"sub": user_id, "role": "user|owner|admin", "type": "access", "exp": ...}
    refresh: {"sub": user_id, "type": "refresh", "exp": ...}

Both signed HS256 with `settings.SECRET_KEY`.
"""

from __future__ import annotations

import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Literal

import jwt
import bcrypt

from app.core.config import settings


# ---------------------------------------------------------------------------
# Passwords
# ---------------------------------------------------------------------------
def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


# ---------------------------------------------------------------------------
# JWT
# ---------------------------------------------------------------------------
TokenType = Literal["access", "refresh"]


def _expiry(token_type: TokenType) -> datetime:
    minutes = (
        settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
        if token_type == "access"
        else settings.JWT_REFRESH_TOKEN_EXPIRE_MINUTES
    )
    return datetime.now(tz=timezone.utc) + timedelta(minutes=minutes)


def create_access_token(
    *, subject: str | int, role: str, extra: dict[str, Any] | None = None
) -> str:
    payload: dict[str, Any] = {
        "sub": str(subject),
        "role": role,
        "type": "access",
        "iat": datetime.now(tz=timezone.utc),
        "exp": _expiry("access"),
    }
    if extra:
        payload.update(extra)
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(*, subject: str | int) -> str:
    payload: dict[str, Any] = {
        "sub": str(subject),
        "type": "refresh",
        "iat": datetime.now(tz=timezone.utc),
        "exp": _expiry("refresh"),
        "jti": secrets.token_urlsafe(16),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(
    token: str, *, expected_type: TokenType | None = None
) -> dict[str, Any]:
    """
    Decode and validate a JWT. Raises `jwt.InvalidTokenError` (or subclasses) on
    expiry, bad signature, malformed payload, or wrong token type.
    """
    payload = jwt.decode(
        token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
    )
    if expected_type and payload.get("type") != expected_type:
        raise jwt.InvalidTokenError(
            f"Expected {expected_type} token, got {payload.get('type')}"
        )
    return payload


def issue_token_pair(*, user_id: str | int, role: str) -> dict[str, str]:
    """Convenience helper used by login/oauth flows."""
    return {
        "access_token": create_access_token(subject=user_id, role=role),
        "refresh_token": create_refresh_token(subject=user_id),
        "token_type": "bearer",
    }
