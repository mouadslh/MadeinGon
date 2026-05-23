"""Recommandations personnalisées via scoring PostgreSQL (collaborative filtering léger)."""
from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import UUID

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.product import Product
from app.models.user_behavior import UserBehavior

EVENT_WEIGHTS = {"PURCHASE": 3.0, "CART": 2.0, "WISHLIST": 1.5, "VIEW": 1.0}


async def get_recommendations(
    db: AsyncSession,
    user_id: UUID | None = None,
    session_id: str | None = None,
    limit: int = 8,
) -> list[dict[str, Any]]:
    since = datetime.now(timezone.utc) - timedelta(days=30)
    q = select(UserBehavior).where(UserBehavior.created_at >= since)

    if user_id:
        q = q.where(UserBehavior.user_id == user_id)
    elif session_id:
        q = q.where(UserBehavior.session_id == session_id)
    else:
        return await _top_rated(db, limit)

    events = (await db.execute(q)).scalars().all()
    if not events:
        return await _top_rated(db, limit)

    product_ids = [e.product_id for e in events]
    cat_result = await db.execute(select(Product.category_id).where(Product.id.in_(product_ids)))
    categories = {r[0] for r in cat_result.all() if r[0]}

    rec_q = (
        select(Product)
        .options(selectinload(Product.images))
        .where(
            Product.is_active.is_(True),
            Product.is_moderated.is_(True),
            Product.category_id.in_(categories),
            Product.id.notin_(product_ids),
        )
        .order_by(desc(Product.views_count))
        .limit(limit)
    )
    products = list((await db.execute(rec_q)).scalars().all())
    result = [_product_dict(p, "Parce que vous avez exploré des produits similaires") for p in products]

    if len(result) < limit:
        extra = await _top_rated(db, limit - len(result))
        seen = {r["id"] for r in result}
        result.extend(e for e in extra if e["id"] not in seen)

    return result[:limit]


async def _top_rated(db: AsyncSession, limit: int) -> list[dict[str, Any]]:
    q = (
        select(Product)
        .options(selectinload(Product.images))
        .where(Product.is_active.is_(True), Product.is_moderated.is_(True))
        .order_by(desc(Product.views_count))
        .limit(limit)
    )
    products = (await db.execute(q)).scalars().all()
    return [_product_dict(p, "Produits populaires de la semaine") for p in products]


def _product_dict(product: Product, reason: str) -> dict[str, Any]:
    primary = next(
        (i for i in product.images if i.is_primary),
        product.images[0] if product.images else None,
    )
    return {
        "id": str(product.id),
        "title_fr": product.title_fr,
        "title_ar": product.title_ar,
        "price": float(product.price),
        "image_url": primary.url if primary else None,
        "authenticity_badge": product.authenticity_badge,
        "reason": reason,
    }
