from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import CurrentUser, SellerUser
from app.models.order import Order
from app.models.product import Product
from app.models.seller import SellerApplication, SellerProfile
from app.models.user import User
from app.schemas.seller import (
    SellerApplicationResponse,
    SellerApplyRequest,
    SellerProfileResponse,
    SellerProfileUpdate,
    SellerPublicResponse,
)
from app.services.seller_authenticity import compute_seller_authenticity
from app.services.upload_service import upload_file

router = APIRouter(prefix="/sellers", tags=["sellers"])


@router.post("/apply", response_model=SellerApplicationResponse, status_code=201)
async def apply_seller(
    data: SellerApplyRequest,
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    if user.role == "SELLER":
        raise HTTPException(status_code=400, detail="Already a seller")

    pending = (
        await db.execute(
            select(SellerApplication).where(
                SellerApplication.user_id == user.id,
                SellerApplication.status == "PENDING",
            )
        )
    ).scalar_one_or_none()
    if pending:
        raise HTTPException(status_code=400, detail="Application already pending")

    app = SellerApplication(
        user_id=user.id,
        status="PENDING",
        cin_image_url=data.cin_image_url,
        city=data.city,
        craft_type=data.craft_type,
        shop_name=data.shop_name,
    )
    db.add(app)
    await db.flush()
    return app


@router.get("/application/status", response_model=SellerApplicationResponse | None)
async def application_status(
    user: CurrentUser,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SellerApplication)
        .where(SellerApplication.user_id == user.id)
        .order_by(SellerApplication.submitted_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


@router.get("/dashboard")
async def seller_dashboard(user: SellerUser, db: AsyncSession = Depends(get_db)):
    profile = await _get_seller_profile(db, user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Seller profile not found")

    products_count = await db.scalar(
        select(func.count())
        .select_from(Product)
        .where(Product.seller_id == profile.id)
    )
    products_published = await db.scalar(
        select(func.count())
        .select_from(Product)
        .where(
            Product.seller_id == profile.id,
            Product.is_moderated.is_(True),
        )
    )
    products_pending = await db.scalar(
        select(func.count())
        .select_from(Product)
        .where(
            Product.seller_id == profile.id,
            Product.is_moderated.is_(False),
        )
    )
    orders_pending = await db.scalar(
        select(func.count())
        .select_from(Order)
        .where(
            Order.seller_id == profile.id,
            Order.status == "PENDING",
        )
    )
    revenue = await db.scalar(
        select(func.coalesce(func.sum(Order.total), 0)).where(
            Order.seller_id == profile.id,
            Order.payment_status == "PAID",
        )
    )

    return {
        "shop_name": profile.shop_name,
        "products_count": products_count or 0,
        "products_published": products_published or 0,
        "products_pending": products_pending or 0,
        "orders_pending": orders_pending or 0,
        "revenue": float(revenue or 0),
        "rating": float(profile.rating),
        "total_sales": profile.total_sales,
    }


@router.get("/profile", response_model=dict)
async def get_profile(user: SellerUser, db: AsyncSession = Depends(get_db)):
    profile = await _get_seller_profile(db, user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Seller profile not found")
    score = await compute_seller_authenticity(db, profile)
    return _profile_with_score(profile, score)


@router.post("/me/upload-cin")
async def upload_my_cin(
    user: CurrentUser,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    url = await upload_file(file, "cin")
    profile = await _get_seller_profile(db, user.id)
    if profile:
        profile.cin_url = url
        await db.flush()
        return {
            "cin_url": url,
            "seller_profile_id": str(profile.id),
        }
    return {
        "cin_url": url,
        "message": "Use this URL in your seller application",
    }


@router.post("/{seller_id}/upload-cin")
async def upload_seller_cin(
    seller_id: UUID,
    user: CurrentUser,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    profile = (
        await db.execute(
            select(SellerProfile).where(SellerProfile.id == seller_id)
        )
    ).scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Seller profile not found")

    own = await _get_seller_profile(db, user.id)
    if user.role != "ADMIN" and (not own or own.id != profile.id):
        raise HTTPException(status_code=403, detail="Not allowed")

    url = await upload_file(file, "cin")
    profile.cin_url = url
    await db.flush()
    return {"cin_url": url}


@router.get("/{seller_id}")
async def get_seller_detail(seller_id: UUID, db: AsyncSession = Depends(get_db)):
    profile = (
        await db.execute(
            select(SellerProfile).where(SellerProfile.id == seller_id)
        )
    ).scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Seller not found")

    score = await compute_seller_authenticity(db, profile)
    return {
        "id": str(profile.id),
        "shop_name": profile.shop_name,
        "city": profile.city,
        "cin_url": profile.cin_url,
        "cin_verified": profile.cin_verified,
        "authenticity_score": score,
    }


@router.put("/profile", response_model=dict)
async def update_profile(
    data: SellerProfileUpdate,
    user: SellerUser,
    db: AsyncSession = Depends(get_db),
):
    profile = await _get_seller_profile(db, user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Seller profile not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    await db.flush()
    score = await compute_seller_authenticity(db, profile)
    return _profile_with_score(profile, score)


@router.get("/{seller_id}/public", response_model=SellerPublicResponse)
async def public_profile(seller_id: UUID, db: AsyncSession = Depends(get_db)):
    profile = (
        await db.execute(
            select(SellerProfile).where(SellerProfile.id == seller_id)
        )
    ).scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Seller not found")
    return profile


async def _get_seller_profile(db: AsyncSession, user_id: UUID) -> SellerProfile | None:
    result = await db.execute(
        select(SellerProfile).where(SellerProfile.user_id == user_id)
    )
    return result.scalar_one_or_none()


def _profile_with_score(profile: SellerProfile, score: int) -> dict:
    data = SellerProfileResponse.model_validate(profile).model_dump()
    data["authenticity_score"] = score
    data["cin_url"] = profile.cin_url
    data["cin_verified"] = profile.cin_verified
    return data
