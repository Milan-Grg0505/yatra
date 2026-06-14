from fastapi.responses import RedirectResponse
from app.core.exceptions import BadRequest
from app.schemas.auth import ResetPasswordRequest
from app.schemas.auth import VerifyOtpRequest
from app.schemas.auth import SendOtpRequest
from app.api.deps import CurrentUser
from app.schemas.auth import RefreshRequest
import jwt
from datetime import datetime, timezone
from app.models import RefreshToken
from app.core.security import decode_token
from app.core.security import create_refresh_token
from app.core.security import create_access_token
from app.core.exceptions import Unauthorized
from app.core.security import verify_password
from app.schemas.auth import LoginRequest
from app.schemas.auth import UserPublic
from app.core.responses import created
from app.core.exceptions import logger
from app.models.enums import Role
from app.core.security import hash_password
from app.core.exceptions import Conflict
from app.models import User
from sqlalchemy import select
from typing import Any
from app.api.deps import DbDep
from app.schemas.auth import RegisterRequest

from app.core.config import settings
from fastapi import APIRouter, Request, status
from authlib.integrations.starlette_client import OAuth, OAuthError
from app.api.deps import limiter
from app.services import otp_service
from app.models.enums import OtpType
from app.core.responses import ok

router = APIRouter(prefix="/auth", tags=["auth"])

# ---- OAuth client ----------------------------------------------------------
oauth = OAuth()
if settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET:
    oauth.register(
        name="google",
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )


# ---------------------------------------------------------------------------
# Register
# ---------------------------------------------------------------------------
@router.post("/register", status_code=status.HTTP_201_CREATED)
@limiter.limit(settings.RATE_LIMIT_AUTH)
async def register(
    request: Request, body: RegisterRequest, db: DbDep
) -> dict[str, Any]:
    exists = (
        await db.execute(select(User).where(User.email == body.email.lower()))
    ).scalar_one_or_none()
    if exists:
        raise Conflict("An account with this email already exists.")

    user = User(
        name=body.name,
        email=body.email.lower(),
        password_hash=hash_password(body.password),
        phone=body.phone,
        address=body.address,
        role=Role(body.role),
        is_email_verified=False,
        is_approved=None if Role(body.role) == Role.owner else None,
    )
    db.add(user)
    await db.flush()

    # Send verification OTP (best-effort, don't block registration on email failure)
    try:
        await otp_service.create_and_send(
            db, email=user.email, otp_type=OtpType.verification
        )
    except Exception as exc:
        logger.error(
            "Failed to send OTP during registration", email=user.email, error=str(exc)
        )

    await db.commit()
    return created({"user": UserPublic.model_validate(user).model_dump(mode="json")})


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------


@router.post("/login")
@limiter.limit(settings.RATE_LIMIT_AUTH)
async def login(request: Request, body: LoginRequest, db: DbDep) -> dict[str, Any]:
    user = (
        await db.execute(select(User).where(User.email == body.email.lower()))
    ).scalar_one_or_none()
    if (
        not user
        or not user.password_hash
        or not verify_password(body.password, user.password_hash)
    ):
        raise Unauthorized("Invalid credentials")
    if not user.is_email_verified:
        raise Unauthorized("Email not verified")
    if user.is_deleted:
        raise Unauthorized("Account disabled")

    access = create_access_token(subject=user.id, role=user.role.value)
    refresh = create_refresh_token(subject=user.id)
    payload = decode_token(refresh, expected_type="refresh")

    db.add(
        RefreshToken(
            user_id=user.id,
            jti=payload["jti"],
            expires_at=datetime.fromtimestamp(payload["exp"], tz=timezone.utc),
            user_agent=request.headers.get("user-agent"),
            ip_address=request.client.host if request.client else None,
        )
    )

    user.last_login = datetime.now(tz=timezone.utc)
    await db.commit()

    return ok(
        {
            "user": UserPublic.model_validate(user).model_dump(mode="json"),
            "token": access,
            "refresh_token": refresh,
            "token_type": "bearer",
        }
    )


# ---------------------------------------------------------------------------
# Refresh / verify / logout
# ---------------------------------------------------------------------------
@router.post("/refresh")
async def refresh(body: RefreshRequest, db: DbDep) -> dict[str, Any]:
    try:
        payload = decode_token(body.refresh_token, expected_type="refresh")
    except jwt.InvalidTokenError as exc:
        raise Unauthorized("Invalid refresh token") from exc

    rt = (
        await db.execute(select(RefreshToken).where(RefreshToken.jti == payload["jti"]))
    ).scalar_one_or_none()

    if not rt or rt.revoked or rt.expires_at < datetime.now(tz=timezone.utc):
        raise Unauthorized("Refresh token revoked or expired")

    user = (
        await db.execute(select(User).where(User.id == rt.user_id))
    ).scalar_one_or_none()
    if not user or user.is_deleted:
        rt.revoked = True
        await db.commit()
        raise Unauthorized("Account disabled or deleted")

    new_access = create_access_token(subject=user.id, role=user.role.value)
    return ok({"token": new_access, "token_type": "bearer"})


@router.get("/verify")
async def verify(me: CurrentUser) -> dict[str, Any]:
    return ok({"user": UserPublic.model_validate(me).model_dump(mode="json")})


@router.post("/logout")
async def logout(me: CurrentUser, db: DbDep) -> dict[str, Any]:
    # Best-effort revoke all the user's refresh tokens
    rows = (
        (await db.execute(select(RefreshToken).where(RefreshToken.user_id == me.id)))
        .scalars()
        .all()
    )
    for r in rows:
        r.revoked = True
    await db.commit()
    return ok(message="Logged out")


# ---------------------------------------------------------------------------
# OTPs
# ---------------------------------------------------------------------------
@router.post("/send-otp")
@limiter.limit(settings.RATE_LIMIT_AUTH)
async def send_otp(request: Request, body: SendOtpRequest, db: DbDep) -> dict[str, Any]:
    await otp_service.create_and_send(
        db, email=body.email, otp_type=body.type, new_email=body.new_email
    )
    await db.commit()
    return ok(message="OTP sent")


@router.post("/verify-otp")
async def verify_otp(body: VerifyOtpRequest, db: DbDep) -> dict[str, Any]:
    _ = await otp_service.verify(
        db, email=body.email, code=body.otp, otp_type=body.type
    )

    if body.type == OtpType.verification:
        user = (
            await db.execute(select(User).where(User.email == body.email))
        ).scalar_one_or_none()
        if user:
            user.is_email_verified = True

    await db.commit()
    return ok({"verified": True})


@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest, db: DbDep) -> dict[str, Any]:
    await otp_service.verify(
        db, email=body.email, code=body.otp, otp_type=OtpType.password_reset
    )
    user = (
        await db.execute(select(User).where(User.email == body.email))
    ).scalar_one_or_none()
    if not user:
        raise BadRequest("No account found for this email")
    user.password_hash = hash_password(body.new_password)
    await db.commit()
    return ok(message="Password reset")


# ---------------------------------------------------------------------------
# Google OAuth
# ---------------------------------------------------------------------------


@router.get("/google")
async def google_login(request: Request, role: str = "user") -> Any:
    if "google" not in oauth._clients:
        raise BadRequest("Google OAuth not configured")

    if role not in ("user", "owner"):
        role = "user"

    request.session["oauth_role"] = role
    redirect_uri = settings.GOOGLE_REDIRECT_URI
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback")
async def google_callback(request: Request, db: DbDep) -> Any:
    if "google" not in oauth._clients:
        raise BadRequest("Google OAuth not configured")

    try:
        token = await oauth.google.authorize_access_token(request)
    except OAuthError as exc:
        from app.core.logging import get_logger
        get_logger("oauth").error("OAuthError", error=str(exc))
        return RedirectResponse(f"{settings.FRONTEND_URL}/auth/login?error=oauth_failed&reason={exc.error}")

    info = token.get("userinfo") or {}
    email = info.get("email")
    if not email:
        return RedirectResponse(f"{settings.FRONTEND_URL}/auth/login?error=no_email")

    role_param = request.session.pop("oauth_role", "user")
    role = Role.owner if role_param == "owner" else Role.user

    user = (
        await db.execute(select(User).where(User.email == email.lower()))
    ).scalar_one_or_none()

    if not user:
        user = User(
            name=info.get("name") or email.split("@")[0],
            email=email,
            image=info.get("picture"),
            google_id=info.get("sub"),
            is_email_verified=True,
            role=role,
            is_approved=None if role == Role.owner else None,
        )
        db.add(user)
        await db.flush()
    else:
        if not user.google_id:
            user.google_id = info.get("sub")
        if not user.image and info.get("picture"):
            user.image = info["picture"]
        user.is_email_verified = True
    # Generate tokens

    access = create_access_token(subject=user.id, role=user.role.value)
    refresh = create_refresh_token(subject=user.id)
    payload = decode_token(refresh, expected_type="refresh")

    db.add(
        RefreshToken(
            user_id=user.id,
            jti=payload["jti"],
            expires_at=datetime.fromtimestamp(payload["exp"], tz=timezone.utc),
        )
    )
    await db.commit()

    redirect_url = (
        f"{settings.FRONTEND_URL}/oauth/success?token={access}&refresh={refresh}"
    )
    print(f"🔐 OAuth redirect: {settings.FRONTEND_URL}/oauth/success")  # Debug only
    return RedirectResponse(redirect_url)
