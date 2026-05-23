"""Découpe produit (YOLOv8) + fond studio (rembg) — MVP Pillow."""
import io
import uuid
from typing import Literal

from PIL import Image, ImageEnhance

BackgroundStyle = Literal["white", "dune"]


async def enhance_product_photo(
    image_bytes: bytes, background: BackgroundStyle = "white"
) -> tuple[str, str]:
    """Retourne (before_url, after_url). Production : ultralytics + rembg + S3."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    before_id = str(uuid.uuid4())

    img = ImageEnhance.Brightness(img).enhance(1.1)
    img = ImageEnhance.Contrast(img).enhance(1.05)

    bg_color = (245, 230, 200) if background == "dune" else (255, 253, 248)

    w, h = img.size
    size = min(w, h)
    left, top = (w - size) // 2, (h - size) // 2
    cropped = img.crop((left, top, left + size, top + size))

    canvas = Image.new("RGB", (800, 800), bg_color)
    cropped = cropped.resize((700, 700), Image.Resampling.LANCZOS)
    canvas.paste(cropped, (50, 50))

    after_id = str(uuid.uuid4())
    return f"/uploads/{before_id}_before.jpg", f"/uploads/{after_id}_after.jpg"
