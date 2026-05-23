"""Score d'authenticité vendeur (heuristique MVP)."""
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.seller import SellerProfile


async def compute_seller_authenticity(
    db: AsyncSession, profile: SellerProfile | None
) -> int:
    if not profile:
        return 0
    score = 0
    if profile.cin_url:
        score += 25
    if profile.cin_verified:
        score += 30
    if profile.phone_verified:
        score += 20
    if profile.is_verified:
        score += 25
    return min(score, 100)
