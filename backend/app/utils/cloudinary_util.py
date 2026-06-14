"""Thin wrapper around the Cloudinary SDK."""

from __future__ import annotations

import asyncio

from typing import Any


from app.core.config import settings
from app.core.exceptions import ExternalServiceError
from app.core.logging import get_logger

import cloudinary
import cloudinary.uploader

logger = get_logger(__name__)


def _configure_once() -> None:
    if not getattr(_configure_once, "_done", False):
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True,
        )
        _configure_once._done = True  # type: ignore[attr-defined]


async def upload_image(
    file_bytes: bytes,
    *,
    folder: str | None = None,
    public_id: str | None = None,
) -> dict[str, Any]:
    """Upload a single image, returns {url, public_id, width, height, format}."""
    _configure_once()
    if not settings.CLOUDINARY_CLOUD_NAME:
        raise ExternalServiceError("Cloudinary not configured")

    target_folder = folder or settings.CLOUDINARY_FOLDER
    try:
        result = await asyncio.to_thread(
            cloudinary.uploader.upload,
            file_bytes,
            folder=target_folder,
            public_id=public_id,
            resource_type="image",
            overwrite=True,
            unique_filename=public_id is None,
        )
    except Exception as exc:
        logger.error("cloudinary_upload_failed", error=str(exc))
        raise ExternalServiceError("Image upload failed") from exc

    return {
        "url": result["secure_url"],
        "public_id": result["public_id"],
        "width": result.get("width"),
        "height": result.get("height"),
        "format": result.get("format"),
    }


async def delete_image(public_id: str) -> None:
    _configure_once()
    if not public_id:
        return
    try:
        await asyncio.to_thread(cloudinary.uploader.destroy, public_id, invalidate=True)
    except Exception as exc:
        logger.warning("cloudinary_delete_failed", public_id=public_id, error=str(exc))


async def get_image_tags(public_id: str) -> list[dict[str, Any]]:
    """Use Cloudinary's AI-tagging add-on (set via account)."""
    _configure_once()
    try:
        result = await asyncio.to_thread(
            cloudinary.uploader.explicit,
            public_id,
            type="upload",
            categorization="google_tagging",
            auto_tagging=0.5,
        )
        return result.get("tags", [])
    except Exception as exc:
        logger.warning("cloudinary_tags_failed", error=str(exc))
        return []
