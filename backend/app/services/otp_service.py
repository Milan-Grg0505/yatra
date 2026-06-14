from app.services.email_service import send_email
from app.core.exceptions import BadRequest
from datetime import timedelta
from app.core.exceptions import TooManyRequests
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import secrets
import hashlib
from app.models.enums import OtpType
from app.models.user import Otp

OTP_VALIDITY_MINUTES = 10
OTP_MAX_ATTEMPTS = 5


def _hash_code(code: str) -> str:
    return hashlib.sha256(code.encode()).hexdigest()


def _generate_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


async def create_and_send(
    db: AsyncSession, *, email: str, otp_type: OtpType, new_email: str | None = None
) -> None:
    """Generate, store (hashed), and email an OTP."""

    # Rate limit: one OTP per 60s per email/type
    recent = (
        await db.execute(
            select(Otp)
            .where(Otp.email == email, Otp.type == otp_type)
            .order_by(Otp.created_at.desc())
            .limit(1)
        )
    ).scalar_one_or_none()

    if (
        recent
        and (datetime.now(tz=timezone.utc) - recent.created_at).total_seconds() < 60
    ):
        raise TooManyRequests("Please wait 60 seconds before requesting another OTP")

    code = _generate_code()

    otp = Otp(
        email=email,
        code_hash=_hash_code(code),
        type=otp_type,
        expires_at=datetime.now(tz=timezone.utc)
        + timedelta(minutes=OTP_VALIDITY_MINUTES),
        new_email=new_email,
    )
    db.add(otp)
    await db.flush()

    subject = {
        OtpType.verification: "Verify your Yatra account",
        OtpType.password_reset: "Reset your Yatra password",
        OtpType.email_change: "Confirm your new email",
    }[otp_type]

    await send_email(
        to=[email],
        subject=subject,
        template_name="otp",
        context={"otp": code, "expiry_m": OTP_VALIDITY_MINUTES},
    )


async def verify(db: AsyncSession, *, email: str, code: str, otp_type: OtpType) -> Otp:
    """Validate an OTP and mark it used. Raises BadRequest on failure."""

    candidate = await db.execute(
        select(Otp)
        .where(
            Otp.email == email,
            Otp.type == otp_type,
            Otp.used == False,  # noqa:E712
        )
        .order_by(Otp.created_at.desc())
        .limit(1)
    )
    otp = candidate.scalar_one_or_none()

    if not otp:
        raise BadRequest("No active code found — please request a new one")
    if otp.expires_at < datetime.now(tz=timezone.utc):
        raise BadRequest("OTP has expired. Request a new one.")

    if otp.attempts >= OTP_MAX_ATTEMPTS:
        raise BadRequest("Too many attempts. Request a new OTP.")

    otp.attempts += 1

    if otp.code_hash != _hash_code(code):
        await db.flush()
        raise BadRequest("Invalid OTP code")

    otp.used = True
    await db.flush()
    return otp
