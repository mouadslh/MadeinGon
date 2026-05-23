"""Validation des URLs d'images produit."""
import re
from urllib.parse import urlparse

ALLOWED_IMAGE_HOSTS = frozenset({"images.unsplash.com", "res.cloudinary.com"})
IMAGE_PATH_RE = re.compile(r"\.(jpe?g|png|gif|webp|avif)(\?|$)", re.I)


def is_valid_product_image_url(url: str) -> bool:
    if not url or not url.strip():
        return False
    try:
        parsed = urlparse(url.strip())
    except ValueError:
        return False
    if parsed.scheme != "https" or not parsed.netloc:
        return False
    host = parsed.netloc.lower()
    if host in ALLOWED_IMAGE_HOSTS:
        return True
    return bool(IMAGE_PATH_RE.search(parsed.path or ""))
