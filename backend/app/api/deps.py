"""
Reusable FastAPI dependencies.

`get_db`           : async DB session
`current_user`     : decodes JWT, loads User from DB, raises 401 if missing
`current_user_opt` : same but returns None (for endpoints that work with/without auth)
`require_admin`    : 403 if user.role != admin
`require_owner_or_admin`
`limiter`          : slowapi instance used by the app

We intentionally do NOT auto-decode the body of the request — that's the
route handler's job via the Pydantic schema.
"""

# Re-export get_db for convenience
from app.core.exceptions import Forbidden
from app.models.enums import Role
from sqlalchemy import select
import jwt
from app.core.exceptions import Unauthorized
from app.core.security import decode_token
from app.models.user import User
from app.core.config import settings
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.database import get_db
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.util.typing import Annotated

from slowapi import Limiter
from slowapi.util import get_remote_address
import uuid

__all__ = [
    "get_db",
    "current_user",
    "current_user_opt",
    "require_admin",
    "require_owner_or_admin",
    "require_approved_owner",
    "require_approved_owner_or_admin",
    "limiter",
    "DbDep",
    "CurrentUser",
    "CurrentUserOpt",
    "AdminUser",
    "OwnerAdminUser",
    "ApprovedOwnerUser",
    "ApprovedOwnerAdminUser",
]

DbDep = Annotated[(AsyncSession, Depends(get_db))]

# auto_error=False so missing tokens raise our typed exception instead of HTTPException
_bearer = HTTPBearer(auto_error=False)

# ----------------------------------------------------------------------------
# Rate limiter (singleton; used in app.main to attach to app.state)
#
# We try to use Redis so limits are shared across workers. If Redis is not
# reachable, slowapi falls back to in-memory automatically by passing
# storage_uri="memory://". Devs without Redis still get a working API.
#


def _make_limiter() -> Limiter:
    # Try Redis first; if unreachable, fall back to memory.
    try:
        import redis

        client = redis.Redis.from_url(settings.REDIS_URL, socket_connect_timeout=1)
        client.ping()
        storage_url = settings.REDIS_URL
    except Exception:
        storage_url = "memory://"

    return Limiter(
        key_func=get_remote_address,
        default_limits=[settings.RATE_LIMIT_DEFAULT],
        storage_uri=storage_url,
    )


limiter = _make_limiter()


# ----------------------------------------------------------------------------
# Auth
# ----------------------------------------------------------------------------
async def _decode_and_fetch(
    creds: HTTPAuthorizationCredentials | None,
    db: AsyncSession,
) -> User | None:
    if not creds or not creds.credentials:
        return None

    try:
        payload = decode_token(creds.credentials, expected_type="access")
    except jwt.ExpiredSignatureError as exc:
        raise Unauthorized("Token expired") from exc
    except jwt.InvalidTokenError as exc:
        raise Unauthorized("Invalid token") from exc

    # User
    user_id = payload.get("sub")
    if not user_id:
        return None

    try:
        uid = uuid.UUID(user_id)
    except ValueError as exc:
        raise Unauthorized("Malformed subject") from exc

    user = (await db.execute(select(User).where(User.id == uid))).scalar_one_or_none()
    if user is None or user.is_deleted:
        return None
    return user


async def current_user(
    creds: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
    db: DbDep,
) -> User:
    user = await _decode_and_fetch(creds, db)
    if user is None:
        raise Unauthorized("Authentication required")
    return user


async def current_user_opt(
    creds: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
    db: DbDep,
) -> User | None:
    return await _decode_and_fetch(creds, db)


def require_admin(user: Annotated[User, Depends(current_user)]) -> User:
    if user.role != Role.admin:
        raise Forbidden("Admin access required")
    return user


def require_owner_or_admin(user: Annotated[User, Depends(current_user)]) -> User:
    if user.role not in {Role.owner, Role.admin}:
        raise Forbidden("Owner access required")
    return user


def require_approved_owner(user: Annotated[User, Depends(current_user)]) -> User:
    if user.role != Role.owner:
        raise Forbidden("Owner access required")
    if user.is_approved is not True:
        raise Forbidden("Owner account not yet approved by admin")
    return user


def require_approved_owner_or_admin(user: Annotated[User, Depends(current_user)]) -> User:
    if user.role == Role.admin:
        return user
    if user.role != Role.owner:
        raise Forbidden("Owner access required")
    if user.is_approved is not True:
        raise Forbidden("Owner account not yet approved by admin")
    return user


CurrentUser = Annotated[User, Depends(current_user)]
CurrentUserOpt = Annotated[User | None, Depends(current_user_opt)]
AdminUser = Annotated[User, Depends(require_admin)]
OwnerAdminUser = Annotated[User, Depends(require_owner_or_admin)]
ApprovedOwnerUser = Annotated[User, Depends(require_approved_owner)]
ApprovedOwnerAdminUser = Annotated[User, Depends(require_approved_owner_or_admin)]
