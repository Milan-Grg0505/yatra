from app.core.config import settings
from app.core.logging import get_logger
from jinja2 import Environment, select_autoescape

from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

logger = get_logger(__name__)

# Inline Jinja templates so we don't ship a separate templates folder.
_TEMPLATES = {
    "otp": """
        <div style="font-family:Poppins,sans-serif;max-width:560px;margin:auto;background:#fff;padding:32px;border-radius:16px;border:1px solid #e2e8f0;">
          <h1 style="color:#3b82f6;margin:0 0 8px 0;">Yatra</h1>
          <h2 style="color:#0f172a;font-weight:600;margin-top:24px;">{{ subject }}</h2>
          <p style="color:#475569;line-height:1.55;">Use the code below. It expires in 10 minutes.</p>
          <div style="margin:24px 0;background:#f1f5f9;border-radius:12px;padding:20px;text-align:center;letter-spacing:8px;font-size:32px;font-weight:700;color:#1e3a8a;">{{ otp }}</div>
          <p style="color:#94a3b8;font-size:12px;margin-top:32px;">If you didn't request this, you can safely ignore the email.</p>
        </div>
    """,
    "booking_confirmation": """
        <div style="font-family:Poppins,sans-serif;max-width:560px;margin:auto;padding:32px;">
          <h1 style="color:#3b82f6;">Booking confirmed 🎉</h1>
          <p>Hi {{ name }},</p>
          <p>Your stay at <strong>{{ hotel }}</strong> from <strong>{{ check_in }}</strong> to <strong>{{ check_out }}</strong> is confirmed.</p>
          <p>Booking ID: <code>{{ booking_id }}</code></p>
          <p>Total: <strong>NPR {{ total }}</strong></p>
          <p style="margin-top:24px;color:#94a3b8;">Travel safe — the Yatra team</p>
        </div>
    """,
}

_jinja = Environment(autoescape=select_autoescape(["html", "xml"]))


def _conf() -> ConnectionConfig:
    return ConnectionConfig(
        MAIL_USERNAME=settings.MAIL_USERNAME,
        MAIL_PASSWORD=settings.MAIL_PASSWORD,
        MAIL_FROM=settings.MAIL_FROM,
        MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
        MAIL_PORT=settings.MAIL_PORT,
        MAIL_SERVER=settings.MAIL_SERVER,
        MAIL_STARTTLS=settings.MAIL_STARTTLS,
        MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
        USE_CREDENTIALS=bool(settings.MAIL_USERNAME),
        VALIDATE_CERTS=True,
    )


async def send_email(
    *,
    to: list[str],
    subject: str,
    template_name: str,
    context: dict,
) -> None:
    if template_name not in _TEMPLATES:
        raise ValueError(f"Unknown template: {template_name}")
    if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
        logger.info("email_skipped_missing_credentials", to=to, subject=subject, ctx=context)
        return

    html = _jinja.from_string(_TEMPLATES[template_name]).render(
        subject=subject, **context
    )
    msg = MessageSchema(
        subject=subject,
        recipients=to,
        body=html,
        subtype=MessageType.html,
    )
    try:
        await FastMail(_conf()).send_message(msg)
    except Exception as exc:
        logger.error("email_send_failed", to=to, error=str(exc))
