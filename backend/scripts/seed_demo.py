"""Seed demo admin, seller, and products. Run: python -m scripts.seed_demo"""
import asyncio
import sys
from decimal import Decimal
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models.category import Category
from app.models.product import Product, ProductImage
from app.models.seller import SellerProfile
from app.models.user import User


async def seed():
    async with AsyncSessionLocal() as db:
        admin = await db.execute(select(User).where(User.email == "admin@madeingoun.ma"))
        if not admin.scalar_one_or_none():
            db.add(
                User(
                    email="admin@madeingoun.ma",
                    password_hash=hash_password("admin12345"),
                    full_name="Admin GOUN",
                    role="ADMIN",
                )
            )
        seller_user = await db.execute(select(User).where(User.email == "artisan@madeingoun.ma"))
        su = seller_user.scalar_one_or_none()
        if not su:
            su = User(
                email="artisan@madeingoun.ma",
                password_hash=hash_password("seller12345"),
                full_name="Fatima Artisan",
                role="SELLER",
                phone="+212600000001",
            )
            db.add(su)
            await db.flush()
            profile = SellerProfile(
                user_id=su.id,
                shop_name="Atelier Fatima",
                city="Guelmim",
                bio_fr="Tapis et artisanat berbère authentique de la région.",
                bio_ar="سجاد وحرف بربرية أصيلة من المنطقة.",
                is_verified=True,
                rating=Decimal("4.80"),
                total_sales=42,
            )
            db.add(profile)
            await db.flush()
            cat = (await db.execute(select(Category).where(Category.slug == "artisanat"))).scalar_one()
            p = Product(
                seller_id=profile.id,
                category_id=cat.id,
                title_fr="Tapis berbère fait main",
                title_ar="سجادة بربرية مصنوعة يدوياً",
                description_fr="Tapis traditionnel tissé à Guelmim, laine naturelle.",
                description_ar="سجادة تقليدية منسوجة في كلميم، صوف طبيعي.",
                price=Decimal("850.00"),
                stock=5,
                is_active=True,
                is_moderated=True,
                authenticity_badge="GOUN_AUTHENTIC",
                authenticity_score=92,
                keywords=["tapis", "berbère", "guelmim"],
            )
            db.add(p)
            await db.flush()
            db.add(
                ProductImage(
                    product_id=p.id,
                    url="https://images.unsplash.com/photo-1600166896089-ffad09d602e4?w=600",
                    is_primary=True,
                )
            )
        await db.commit()
    print("Demo data seeded.")


if __name__ == "__main__":
    asyncio.run(seed())
