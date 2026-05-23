"""Amélioration photo produit locale (rembg + Pillow)."""
import io

from PIL import Image, ImageEnhance, ImageOps
from rembg import remove


def remove_background(image_bytes: bytes) -> bytes:
    """Supprime l'arrière-plan et retourne PNG."""
    output = remove(image_bytes)
    return output


def enhance_image(image_bytes: bytes) -> bytes:
    """Auto-contraste, luminosité et netteté → JPEG optimisé."""
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = ImageOps.autocontrast(img)
    img = ImageEnhance.Brightness(img).enhance(1.1)
    img = ImageEnhance.Sharpness(img).enhance(1.3)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=88, optimize=True)
    return buf.getvalue()


def enhance_product_photo(image_bytes: bytes) -> bytes:
    """Détourage puis amélioration couleur."""
    cutout = remove_background(image_bytes)
    try:
        img = Image.open(io.BytesIO(cutout)).convert("RGBA")
        bg = Image.new("RGB", img.size, (255, 253, 248))
        bg.paste(img, mask=img.split()[3])
        buf = io.BytesIO()
        bg.save(buf, format="PNG")
        return enhance_image(buf.getvalue())
    except Exception:
        return enhance_image(cutout)
