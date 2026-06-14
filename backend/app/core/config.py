# Application configuration module
# Settings are loaded from environment variables (or a .env file) and validated
# by Pydantic. Import `settings` from this module anywhere — never re‑read env.
# This is the single source of truth for configuration.

from __future__ import annotations


from pydantic_core.core_schema import ValidationInfo

from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # --- App ---
    APP_NAME: str = "Yatra"
    APP_ENV: Literal["development", "staging", "production"] = "development"
    DEBUG: bool = True
    LOG_LEVEL: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"
    API_V1_PREFIX: str = "/api/v1"
    BASE_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:5173"

    # --- Server ---
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    WORKERS: int = 1
    CORS_ORIGINS: str = "http://localhost:5173"

    # --- Database ---
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/yatra"
    DATABASE_URL_SYNC: str = (
        "postgresql+psycopg2://postgres:postgres@localhost:5432/yatra"
    )
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_RECYCLE: int = 3600

    # --- Redis ---
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # --- Security ---
    SECRET_KEY: str = Field(default="change-me", min_length=8)
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    JWT_REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30
    JWT_ALGORITHM: str = "HS256"

    # --- Google OAuth ---
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/google/callback"

    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = ""
    MAIL_FROM_NAME: str = "Yatra"
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_PORT: int = 587
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False

    # --- Cloudinary ---
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    CLOUDINARY_FOLDER: str = "yatra"

    # --- OpenAI / LLM ---
    OPENAI_API_KEY: str = ""
    OPENAI_ORG_ID: str = ""
    OPENAI_PROJECT_ID: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"
    OPENAI_VISION_MODEL: str = "gpt-4o"
    LLM_TEMPERATURE: float = 0.4

    # --- Google Vision ---
    GOOGLE_APPLICATION_CREDENTIALS: str = ""
    GOOGLE_APPLICATION_CREDENTIALS_B64: str = ""

    # --- Twilio ---
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""

    # --- eSewa ---
    ESEWA_MERCHANT_CODE: str = "EPAYTEST"
    ESEWA_SECRET_KEY: str = "8gBm/:&EnhH.1/q"
    ESEWA_VERIFY_URL: str = "https://rc.esewa.com.np/api/epay/transaction/status/"
    ESEWA_RETURN_URL: str = "http://localhost:5173/payment/esewa/return"
    ESEWA_FAILURE_URL: str = "http://localhost:5173/payment/esewa/failure"

    # --- Khalti ---
    KHALTI_SECRET_KEY: str = ""
    KHALTI_PUBLIC_KEY: str = ""
    KHALTI_BASE_URL: str = "https://a.khalti.com/api/v2"
    KHALTI_RETURN_URL: str = "http://localhost:5173/payment/khalti/return"

    # --- Rate limits ---
    RATE_LIMIT_DEFAULT: str = "200/minute"
    RATE_LIMIT_AUTH: str = "20/minute"
    RATE_LIMIT_AI: str = "30/minute"

    # --- Feature toggles ---
    ENABLE_TRIP_PLANNER: bool = True
    ENABLE_VOICE_BOT: bool = True
    ENABLE_VISION_ANALYSIS: bool = True
    ENABLE_SENTIMENT_ANALYSIS: bool = True
    ENABLE_CONTENT_MODERATION: bool = True

    # ------------------------------------------------------------------
    # Validators / helpers
    # ------------------------------------------------------------------
    @field_validator("MAIL_USERNAME", "MAIL_PASSWORD", "MAIL_FROM")
    def validate_email_credentials(cls, v, info: ValidationInfo):
        # Allow missing credentials in non-production environments
        if info.data.get("APP_ENV") != "production" and not v:
            return v
        if not v:
            raise ValueError(f"{info.field_name} must be set for email functionality")
        return v

    @field_validator("CORS_ORIGINS")
    @classmethod
    def _validate_origins(cls, v: str) -> str:  # noqa: D401
        # accept either a CSV string or already a list-ish input
        return v.strip()

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Cached settings instance — first call validates env vars, rest are O(1)."""
    return Settings()  # type: ignore[call-arg]


settings = get_settings()
