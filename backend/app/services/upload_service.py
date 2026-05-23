"""Upload fichiers vers Cloudinary."""
import os

import cloudinary
import cloudinary.uploader
from fastapi import HTTPException, UploadFile

from app.core.config import get_settings

settings = get_settings()


def _configure_cloudinary() -> None:
    if settings.CLOUDINARY_URL:
        os.environ.setdefault("CLOUDINARY_URL", settings.CLOUDINARY_URL)
        cloudinary.config()
        return
    if not settings.CLOUDINARY_CLOUD_NAME:
        raise HTTPException(status_code=503, detail="Cloudinary not configured")
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True,
    )


async def upload_file(file: UploadFile, folder: str) -> str:
    """Upload un fichier et retourne l'URL sécurisée Cloudinary."""
    _configure_cloudinary()
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")
    try:
        result = cloudinary.uploader.upload(
            content,
            folder=f"madeingoun/{folder}".rstrip("/"),
            resource_type="auto",
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Upload failed: {exc}") from exc
    url = result.get("secure_url")
    if not url:
        raise HTTPException(status_code=502, detail="Upload returned no URL")
    return url
