from decimal import Decimal
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import OptionalUser, SellerUser
from app.models.category import Category
from app.models.product import Product, ProductImage
from app.models.seller import SellerProfile
from app.models.user import User
from app.schemas.product import (
    ProductCreate,
    ProductListResponse,
    ProductResponse,
    ProductUpdate,
)
from app.services.upload_service import upload_file

router = APIRouter(prefix="/products", tags=["products"])


def _to_response(p: Product) -> ProductResponse:
    return ProductResponse.model_validate(p)


@router.get("", response_model=ProductListResponse)
async def list_products(
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category_id: Optional[int] = None,
    category_slug: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
):
    q = (
        select(Product)
        .options(selectinload(Product.images))
        .where(
            Product.is_active.is_(True),
            Product.is_moderated.is_(True),
            Product.status == "approved",
        )
    )
    if category_slug:
        cat_row = await db.execute(
            select(Category.id).where(Category.slug == category_slug)
        )
        cid = cat_row.scalar_one_or_none()
        if cid:
            q = q.where(Product.category_id == cid)
    elif category_id is not None:
        q = q.where(Product.category_id == category_id)
    if search:
        pattern = f"%{search}%"
        q = q.where(
            or_(
                Product.title_fr.ilike(pattern),
                Product.description_fr.ilike(pattern),
            )
        )
    if min_price is not None:
        q = q.where(Product.price >= Decimal(str(min_price)))
    if max_price is not None:
        q = q.where(Product.price <= Decimal(str(max_price)))

    count_q = select(func.count()).select_from(q.subquery())
    total = await db.scalar(count_q) or 0

    q = (
        q.offset((page - 1) * page_size)
        .limit(page_size)
        .order_by(Product.created_at.desc())
    )
    items = (await db.execute(q)).scalars().all()

    return ProductListResponse(
        items=[_to_response(p) for p in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/seller/mine", response_model=ProductListResponse)
async def my_products(
    user: SellerUser,
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    profile = (
        await db.execute(
            select(SellerProfile).where(SellerProfile.user_id == user.id)
        )
    ).scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Seller profile not found")

    q = (
        select(Product)
        .options(selectinload(Product.images))
        .where(Product.seller_id == profile.id)
        .order_by(Product.created_at.desc())
    )
    count_q = select(func.count()).select_from(q.subquery())
    total = await db.scalar(count_q) or 0
    q = q.offset((page - 1) * page_size).limit(page_size)
    items = (await db.execute(q)).scalars().all()

    return ProductListResponse(
        items=[_to_response(p) for p in items],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: UUID,
    db: AsyncSession = Depends(get_db),
    _user: OptionalUser = None,
):
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.images))
        .where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.views_count += 1
    await db.flush()
    return _to_response(product)


@router.post("/upload-image")
async def upload_product_image_temp(
    user: SellerUser,
    file: UploadFile = File(...),
):
    """Upload image produit avant création (dossier products/)."""
    url = await upload_file(file, "products")
    return {"url": url}


@router.post("", response_model=ProductResponse, status_code=201)
async def create_product(
    data: ProductCreate,
    user: SellerUser,
    db: AsyncSession = Depends(get_db),
):
    seller_user = await db.get(User, user.id)
    if (
        seller_user
        and seller_user.role == "SELLER"
        and seller_user.seller_status != "active"
    ):
        raise HTTPException(status_code=403, detail="Seller account is not active")

    profile = (
        await db.execute(
            select(SellerProfile).where(SellerProfile.user_id == user.id)
        )
    ).scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=403, detail="Seller profile required")

    product = Product(
        seller_id=profile.id,
        category_id=data.category_id,
        title_fr=data.title_fr,
        title_ar=data.title_ar,
        description_fr=data.description_fr,
        description_ar=data.description_ar,
        price=data.price,
        stock=data.stock,
        lead_time_days=data.lead_time_days,
        keywords=data.keywords,
        is_moderated=False,
        status="pending",
        is_active=True,
    )
    db.add(product)
    await db.flush()

    for i, url in enumerate(data.image_urls):
        db.add(
            ProductImage(
                product_id=product.id,
                url=url,
                is_primary=(i == 0),
                sort_order=i,
            )
        )

    await db.refresh(product, ["images"])
    return _to_response(product)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: UUID,
    data: ProductUpdate,
    user: SellerUser,
    db: AsyncSession = Depends(get_db),
):
    product = await _own_product(db, user, product_id)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    await db.flush()
    await db.refresh(product, ["images"])
    return _to_response(product)


@router.delete("/{product_id}", status_code=204)
async def delete_product(
    product_id: UUID,
    user: SellerUser,
    db: AsyncSession = Depends(get_db),
):
    product = await _own_product(db, user, product_id)
    await db.delete(product)


@router.patch("/{product_id}/toggle", response_model=ProductResponse)
async def toggle_product(
    product_id: UUID,
    user: SellerUser,
    db: AsyncSession = Depends(get_db),
):
    product = await _own_product(db, user, product_id)
    product.is_active = not product.is_active
    await db.flush()
    await db.refresh(product, ["images"])
    return _to_response(product)


async def _own_product(db: AsyncSession, user: User, product_id: UUID) -> Product:
    profile = (
        await db.execute(
            select(SellerProfile).where(SellerProfile.user_id == user.id)
        )
    ).scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=403, detail="Not a seller")

    result = await db.execute(
        select(Product)
        .options(selectinload(Product.images))
        .where(Product.id == product_id, Product.seller_id == profile.id)
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
