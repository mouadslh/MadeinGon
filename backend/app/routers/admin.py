from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import AdminUser
from app.core.security import generate_temp_password, hash_password
from app.models.dispute import Dispute
from app.models.order import Order
from app.models.product import Product
from app.models.seller import SellerApplication, SellerProfile
from app.models.user import User
from app.schemas.seller import AdminCreateSellerRequest, RejectApplicationRequest, SellerApplicationResponse
from app.services.notification_service import notify_seller_decision

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/sellers/pending", response_model=list[SellerApplicationResponse])
async def pending_sellers(admin: AdminUser, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SellerApplication).where(SellerApplication.status == "PENDING").order_by(SellerApplication.submitted_at)
    )
    return result.scalars().all()


@router.post("/sellers/{application_id}/approve")
async def approve_seller(application_id: UUID, admin: AdminUser, db: AsyncSession = Depends(get_db)):
    app = await db.get(SellerApplication, application_id)
    if not app or app.status != "PENDING":
        raise HTTPException(status_code=404, detail="Application not found")
    user = await db.get(User, app.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = "SELLER"
    profile = SellerProfile(
        user_id=user.id,
        shop_name=app.shop_name or f"Boutique {user.full_name}",
        city=app.city,
        bio_fr=app.bio,
    )
    db.add(profile)
    app.status = "APPROVED"
    app.reviewed_by = admin.id
    app.reviewed_at = datetime.now(timezone.utc)
    await notify_seller_decision(user.email, user.phone, approved=True)
    return {"message": "Seller approved"}


@router.post("/sellers/{application_id}/reject")
async def reject_seller(
    application_id: UUID, data: RejectApplicationRequest, admin: AdminUser, db: AsyncSession = Depends(get_db)
):
    app = await db.get(SellerApplication, application_id)
    if not app or app.status != "PENDING":
        raise HTTPException(status_code=404, detail="Application not found")
    app.status = "REJECTED"
    app.admin_note = data.admin_note
    app.reviewed_by = admin.id
    app.reviewed_at = datetime.now(timezone.utc)
    user = await db.get(User, app.user_id)
    if user:
        await notify_seller_decision(user.email, user.phone, approved=False, note=data.admin_note)
    return {"message": "Application rejected"}


@router.post("/sellers/create")
async def create_seller(data: AdminCreateSellerRequest, admin: AdminUser, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.phone == data.phone))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Phone already registered")
    temp_pass = generate_temp_password()
    user = User(
        phone=data.phone,
        full_name=data.full_name,
        password_hash=hash_password(temp_pass),
        role="SELLER",
    )
    db.add(user)
    await db.flush()
    profile = SellerProfile(
        user_id=user.id,
        shop_name=data.shop_name,
        city=data.city,
        bio_fr=data.craft_type,
        is_verified=True,
    )
    db.add(profile)
    from app.services.notification_service import send_sms

    await send_sms(data.phone, f"Made in GON — Compte vendeur créé. Mot de passe: {temp_pass}")
    return {"message": "Seller created", "user_id": str(user.id)}


@router.get("/products/unmoderated")
async def unmoderated_products(admin: AdminUser, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.images))
        .where(Product.is_moderated == False)
        .order_by(Product.created_at.desc())
    )
    products = result.scalars().all()
    return [
        {
            "id": str(p.id),
            "title_fr": p.title_fr,
            "authenticity_score": float(p.authenticity_score) if p.authenticity_score else None,
            "image_url": p.images[0].url if p.images else None,
        }
        for p in products
    ]


@router.post("/products/{product_id}/approve")
async def approve_product(product_id: UUID, admin: AdminUser, db: AsyncSession = Depends(get_db)):
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_moderated = True
    product.moderated_by = admin.id
    product.is_active = True
    return {"message": "Product published"}


@router.delete("/products/{product_id}")
async def delete_product_admin(product_id: UUID, admin: AdminUser, db: AsyncSession = Depends(get_db)):
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    await db.delete(product)
    return {"message": "Product removed"}


@router.get("/disputes")
async def list_disputes(admin: AdminUser, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Dispute).order_by(Dispute.created_at.desc()))
    return result.scalars().all()


@router.post("/disputes/{dispute_id}/resolve")
async def resolve_dispute(
    dispute_id: UUID, resolution_note: str, admin: AdminUser, db: AsyncSession = Depends(get_db)
):
    dispute = await db.get(Dispute, dispute_id)
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    dispute.status = "RESOLVED"
    dispute.resolution_note = resolution_note
    dispute.resolved_by = admin.id
    dispute.resolved_at = datetime.now(timezone.utc)
    return {"message": "Dispute resolved"}


@router.get("/stats")
async def platform_stats(admin: AdminUser, db: AsyncSession = Depends(get_db)):
    sellers = await db.scalar(select(func.count()).select_from(SellerProfile)) or 0
    pending_products = await db.scalar(
        select(func.count()).select_from(Product).where(Product.is_moderated == False)
    ) or 0
    orders_today = await db.scalar(
        select(func.count()).select_from(Order).where(
            func.date(Order.created_at) == func.current_date()
        )
    ) or 0
    revenue = await db.scalar(
        select(func.coalesce(func.sum(Order.total), 0)).where(Order.payment_status == "PAID")
    ) or 0
    pending_apps = await db.scalar(
        select(func.count()).select_from(SellerApplication).where(SellerApplication.status == "PENDING")
    ) or 0
    return {
        "total_sellers": sellers,
        "products_pending": pending_products,
        "orders_today": orders_today,
        "revenue_month": float(revenue),
        "pending_applications": pending_apps,
    }
