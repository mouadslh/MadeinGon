from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.product import Product
from app.models.seller import SellerProfile
from app.models.user import User

router = APIRouter(tags=["search"])


@router.get("/search")
async def global_search(
    q: str = Query(..., min_length=1, max_length=100),
    locale: str = Query("fr", pattern="^(fr|ar)$"),
    db: AsyncSession = Depends(get_db),
):
    term = f"%{q.strip()}%"
    products_q = (
        select(Product)
        .options(selectinload(Product.images), selectinload(Product.seller))
        .where(
            Product.is_active.is_(True),
            Product.is_moderated.is_(True),
            Product.status == "approved",
            or_(
                Product.title_fr.ilike(term),
                Product.description_fr.ilike(term),
                Product.title_ar.ilike(term),
                Product.description_ar.ilike(term),
            ),
        )
        .limit(5)
    )
    products = (await db.execute(products_q)).scalars().all()

    sellers_q = (
        select(SellerProfile)
        .join(User, User.id == SellerProfile.user_id)
        .where(
            User.is_active.is_(True),
            User.role == "SELLER",
            or_(SellerProfile.shop_name.ilike(term), SellerProfile.city.ilike(term)),
        )
        .limit(3)
    )
    sellers = (await db.execute(sellers_q)).scalars().all()

    def product_name(p: Product) -> str:
        if locale == "ar" and p.title_ar:
            return p.title_ar
        return p.title_fr

    return {
        "products": [
            {
                "id": str(p.id),
                "name": product_name(p),
                "price": float(p.price),
                "image_url": p.images[0].url if p.images else None,
                "seller_name": p.seller.shop_name if p.seller else None,
            }
            for p in products
        ],
        "sellers": [
            {
                "id": str(s.id),
                "shop_name": s.shop_name,
                "city": s.city,
                "avatar_url": s.avatar_url,
            }
            for s in sellers
        ],
    }
