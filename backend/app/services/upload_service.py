"""Upload fichiers vers Cloudinary."""
from urllib.parse import urlparse

import cloudinary
import cloudinary.uploader
from fastapi import HTTPException, UploadFile

from app.core.config import get_settings

settings = get_settings()


def _cloudinary_credentials() -> tuple[str, str, str]:
    cloud_name = settings.CLOUDINARY_CLOUD_NAME
    api_key = settings.CLOUDINARY_API_KEY
    api_secret = settings.CLOUDINARY_API_SECRET

    if settings.CLOUDINARY_URL and not (cloud_name and api_key and api_secret):
        parsed = urlparse(settings.CLOUDINARY_URL)
        cloud_name = cloud_name or (parsed.hostname or "")
        api_key = api_key or (parsed.username or "")
        api_secret = api_secret or (parsed.password or "")

    return cloud_name, api_key, api_secret


def _configure_cloudinary() -> None:
    cloud_name, api_key, api_secret = _cloudinary_credentials()
    if not cloud_name or not api_key or not api_secret:
        raise HTTPException(
            status_code=503,
            detail=(
                "Cloudinary not configured — set CLOUDINARY_CLOUD_NAME, "
                "CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in backend/.env"
            ),
        )
    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
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
