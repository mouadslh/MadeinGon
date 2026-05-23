from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import func, or_, select
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
from app.services.seller_authenticity import compute_seller_authenticity
from app.utils.cin_url import normalize_cin_url

router = APIRouter(prefix="/admin", tags=["admin"])


class AdminSellerUpdate(BaseModel):
    cin_verified: bool | None = None


class RejectProductRequest(BaseModel):
    reason: str


def _product_admin_item(p: Product) -> dict:
    return {
        "id": str(p.id),
        "title_fr": p.title_fr,
        "title_ar": p.title_ar,
        "status": p.status,
        "is_moderated": p.is_moderated,
        "is_active": p.is_active,
        "price": float(p.price),
        "stock": p.stock,
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "image_url": p.images[0].url if p.images else None,
        "seller_name": p.seller.shop_name if p.seller else None,
    }


def _product_admin_detail(p: Product) -> dict:
    return {
        "id": str(p.id),
        "title_fr": p.title_fr,
        "title_ar": p.title_ar,
        "description_fr": p.description_fr,
        "description_ar": p.description_ar,
        "price": float(p.price),
        "stock": p.stock,
        "status": p.status,
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "category": (
            {"name_fr": p.category.name_fr, "name_ar": p.category.name_ar}
            if p.category
            else None
        ),
        "images": [{"url": img.url} for img in p.images],
        "seller": (
            {
                "shop_name": p.seller.shop_name,
                "city": p.seller.city,
                "cin_verified": p.seller.cin_verified,
            }
            if p.seller
            else None
        ),
    }


async def _get_product_for_admin(db: AsyncSession, product_id: UUID) -> Product:
    product = (
        await db.execute(
            select(Product)
            .options(
                selectinload(Product.images),
                selectinload(Product.seller),
                selectinload(Product.category),
            )
            .where(Product.id == product_id)
        )
    ).scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


async def _approve_product(db: AsyncSession, product: Product, admin_id: UUID) -> None:
    product.status = "approved"
    product.is_moderated = True
    product.is_active = True
    product.moderated_by = admin_id
    product.moderation_note = None


async def _reject_product(
    db: AsyncSession, product: Product, admin_id: UUID, reason: str
) -> None:
    product.status = "rejected"
    product.is_moderated = True
    product.is_active = False
    product.moderated_by = admin_id
    product.moderation_note = reason.strip()


def _application_score(app: SellerApplication) -> int:
    return 25 if app.cin_image_url else 0


def _application_payload(app: SellerApplication, user: User) -> dict:
    return {
        "id": str(app.id),
        "user_id": str(app.user_id),
        "full_name": user.full_name,
        "email": user.email,
        "city": app.city,
        "shop_name": app.shop_name,
        "craft_type": app.craft_type,
        "status": app.status,
        "submitted_at": app.submitted_at.isoformat(),
        "cin_image_url": normalize_cin_url(app.cin_image_url),
        "authenticity_score": _application_score(app),
    }


async def _fallback_cin_from_application(db: AsyncSession, user_id: UUID) -> str | None:
    app_url = await db.scalar(
        select(SellerApplication.cin_image_url)
        .where(
            SellerApplication.user_id == user_id,
            SellerApplication.cin_image_url.isnot(None),
        )
        .order_by(SellerApplication.submitted_at.desc())
        .limit(1)
    )
    return normalize_cin_url(app_url)


@router.get("/users")
async def list_users(
    admin: AdminUser,
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = None,
    role: str | None = None,
):
    filters = []
    if role:
        filters.append(User.role == role.upper())
    if search:
        term = f"%{search.strip()}%"
        filters.append(
            or_(
                User.full_name.ilike(term),
                User.email.ilike(term),
                User.phone.ilike(term),
            )
        )

    count_q = select(func.count()).select_from(User)
    if filters:
        count_q = count_q.where(*filters)
    total = await db.scalar(count_q) or 0

    q = select(User).order_by(User.created_at.desc())
    if filters:
        q = q.where(*filters)
    q = q.offset((page - 1) * limit).limit(limit)
    users = (await db.execute(q)).scalars().all()

    return {
        "items": [
            {
                "id": str(u.id),
                "full_name": u.full_name or "",
                "email": u.email,
                "phone": u.phone,
                "role": u.role,
                "is_active": u.is_active,
                "seller_status": u.seller_status,
                "created_at": u.created_at.isoformat(),
            }
            for u in users
        ],
        "total": total,
        "page": page,
        "limit": limit,
    }


@router.patch("/users/{user_id}/activate")
async def activate_user(user_id: UUID, admin: AdminUser, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "ADMIN":
        raise HTTPException(status_code=400, detail="Cannot modify admin account")
    user.is_active = True
    if user.role == "SELLER":
        user.seller_status = "active"
    return {"message": "User activated"}


@router.patch("/users/{user_id}/deactivate")
async def deactivate_user(user_id: UUID, admin: AdminUser, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "ADMIN":
        raise HTTPException(status_code=400, detail="Cannot modify admin account")
    user.is_active = False
    if user.role == "SELLER":
        user.seller_status = "suspended"
    return {"message": "User deactivated"}


@router.get("/sellers/applications")
async def list_seller_applications(
    admin: AdminUser,
    db: AsyncSession = Depends(get_db),
    status: str | None = None,
):
    q = (
        select(SellerApplication, User)
        .join(User, User.id == SellerApplication.user_id)
        .order_by(SellerApplication.submitted_at.desc())
    )
    if status and status.lower() != "all":
        q = q.where(SellerApplication.status == status.upper())
    rows = (await db.execute(q)).all()
    return [_application_payload(app, user) for app, user in rows]


@router.get("/sellers/applications/stats")
async def seller_application_stats(admin: AdminUser, db: AsyncSession = Depends(get_db)):
    pending = await db.scalar(
        select(func.count()).select_from(SellerApplication).where(SellerApplication.status == "PENDING")
    ) or 0
    approved = await db.scalar(
        select(func.count()).select_from(SellerApplication).where(SellerApplication.status == "APPROVED")
    ) or 0
    rejected = await db.scalar(
        select(func.count()).select_from(SellerApplication).where(SellerApplication.status == "REJECTED")
    ) or 0
    return {"pending": pending, "approved": approved, "rejected": rejected}


@router.get("/sellers")
async def list_seller_accounts(
    admin: AdminUser,
    db: AsyncSession = Depends(get_db),
    status: str | None = None,
):
    q = (
        select(User, SellerProfile)
        .join(SellerProfile, SellerProfile.user_id == User.id)
        .where(User.role == "SELLER")
        .order_by(User.created_at.desc())
    )
    if status == "active":
        q = q.where(User.seller_status == "active", User.is_active.is_(True))
    elif status == "suspended":
        q = q.where(or_(User.seller_status == "suspended", User.is_active.is_(False)))

    rows = (await db.execute(q)).all()
    items = []
    for user, profile in rows:
        score = await compute_seller_authenticity(db, profile)
        cin_url = normalize_cin_url(profile.cin_url) or await _fallback_cin_from_application(db, user.id)
        items.append(
            {
                "id": str(user.id),
                "seller_profile_id": str(profile.id),
                "full_name": user.full_name or "",
                "email": user.email,
                "phone": user.phone,
                "is_active": user.is_active,
                "seller_status": user.seller_status,
                "created_at": user.created_at.isoformat(),
                "cin_url": cin_url,
                "cin_verified": profile.cin_verified,
                "authenticity_score": score,
                "shop_name": profile.shop_name,
                "city": profile.city,
            }
        )
    return {"items": items}


@router.patch("/sellers/{user_id}")
async def update_seller_account(
    user_id: UUID,
    data: AdminSellerUpdate,
    admin: AdminUser,
    db: AsyncSession = Depends(get_db),
):
    profile = (
        await db.execute(select(SellerProfile).where(SellerProfile.user_id == user_id))
    ).scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Seller not found")
    if data.cin_verified is not None:
        profile.cin_verified = data.cin_verified
    return {"message": "Seller updated"}


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
    existing_profile = (
        await db.execute(select(SellerProfile).where(SellerProfile.user_id == user.id))
    ).scalar_one_or_none()
    if existing_profile:
        raise HTTPException(status_code=400, detail="Seller profile already exists")

    user.role = "SELLER"
    user.seller_status = "active"
    profile = SellerProfile(
        user_id=user.id,
        shop_name=app.shop_name or f"Boutique {user.full_name}",
        city=app.city,
        bio_fr=app.craft_type,
        cin_url=app.cin_image_url,
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
    if user and user.role != "SELLER":
        user.seller_status = None
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
        seller_status="active",
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


@router.get("/moderation/counts")
async def moderation_counts(admin: AdminUser, db: AsyncSession = Depends(get_db)):
    pending_products = await db.scalar(
        select(func.count()).select_from(Product).where(
            Product.status == "pending", Product.is_moderated.is_(False)
        )
    ) or 0
    pending_sellers = await db.scalar(
        select(func.count()).select_from(SellerApplication).where(SellerApplication.status == "PENDING")
    ) or 0
    return {
        "pending_products": pending_products,
        "pending_sellers": pending_sellers,
        "flagged_reviews": 0,
    }


@router.get("/products")
async def list_admin_products(
    admin: AdminUser,
    db: AsyncSession = Depends(get_db),
    status: str | None = Query("pending"),
):
    q = (
        select(Product)
        .options(
            selectinload(Product.images),
            selectinload(Product.seller),
        )
        .order_by(Product.created_at.desc())
    )
    if status and status != "all":
        if status == "pending":
            q = q.where(Product.status == "pending", Product.is_moderated.is_(False))
        elif status == "approved":
            q = q.where(Product.status == "approved")
        elif status == "rejected":
            q = q.where(Product.status == "rejected")

    products = (await db.execute(q)).scalars().all()
    return {"items": [_product_admin_item(p) for p in products]}


@router.get("/products/{product_id}/detail")
async def admin_product_detail(
    product_id: UUID, admin: AdminUser, db: AsyncSession = Depends(get_db)
):
    product = await _get_product_for_admin(db, product_id)
    return {
        "product": _product_admin_detail(product),
        "seller_name": product.seller.shop_name if product.seller else None,
    }


@router.patch("/products/{product_id}/approve")
async def approve_product_patch(
    product_id: UUID, admin: AdminUser, db: AsyncSession = Depends(get_db)
):
    product = await _get_product_for_admin(db, product_id)
    await _approve_product(db, product, admin.id)
    return {"message": "Product approved"}


@router.patch("/products/{product_id}/reject")
async def reject_product_patch(
    product_id: UUID,
    data: RejectProductRequest,
    admin: AdminUser,
    db: AsyncSession = Depends(get_db),
):
    product = await _get_product_for_admin(db, product_id)
    await _reject_product(db, product, admin.id, data.reason)
    return {"message": "Product rejected"}


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
    product = await _get_product_for_admin(db, product_id)
    await _approve_product(db, product, admin.id)
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
    approved_apps = await db.scalar(
        select(func.count()).select_from(SellerApplication).where(SellerApplication.status == "APPROVED")
    ) or 0
    rejected_apps = await db.scalar(
        select(func.count()).select_from(SellerApplication).where(SellerApplication.status == "REJECTED")
    ) or 0
    return {
        "total_sellers": sellers,
        "products_pending": pending_products,
        "orders_today": orders_today,
        "revenue_month": float(revenue),
        "pending_applications": pending_apps,
        "approved_applications": approved_apps,
        "rejected_applications": rejected_apps,
    }
