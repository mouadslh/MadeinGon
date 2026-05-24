from datetime import timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import SellerUser
from app.models.address import Address
from app.models.order import Order, OrderItem
from app.models.product import Product, ProductImage
from app.models.seller import SellerProfile
from app.models.user import User
from app.schemas.seller_orders import CancelOrderBody, SellerOrderOut, SellerOrdersListResponse
from app.services.delivery.amana import AmanaService
from app.services.delivery.fulfill import auto_fulfill_order
from app.services.delivery.label_pdf import generate_delivery_label_pdf
from app.services.notifications.seller_notif import SellerNotificationService
from app.utils.order_helpers import (
    API_TO_STATUS,
    PAYMENT_METHOD_FROM_API,
    generate_order_reference,
    order_status_api,
    payment_method_api,
    payment_status_api,
)

router = APIRouter(prefix="/seller/orders", tags=["seller-orders"])

STATUS_FILTER = {
    "all": None,
    "pending": "PENDING",
    "confirmed": "CONFIRMED",
    "shipped": "SHIPPED",
    "delivered": "DELIVERED",
    "cancelled": "CANCELLED",
}


async def _get_profile(db: AsyncSession, user_id: UUID) -> SellerProfile:
    result = await db.execute(select(SellerProfile).where(SellerProfile.user_id == user_id))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Seller profile not found")
    return profile


async def _build_order_out(db: AsyncSession, order: Order) -> SellerOrderOut:
    buyer = await db.get(User, order.buyer_id)
    addr = await db.get(Address, order.address_id)
    product_ids = [item.product_id for item in order.items]
    products_by_id: dict = {}
    if product_ids:
        prod_rows = await db.execute(select(Product).where(Product.id.in_(product_ids)))
        products_by_id = {p.id: p for p in prod_rows.scalars().all()}
        img_rows = await db.execute(
            select(ProductImage.product_id, ProductImage.url).where(
                ProductImage.product_id.in_(product_ids),
                ProductImage.is_primary.is_(True),
            )
        )
        primary_images = {row[0]: row[1] for row in img_rows.all()}
    else:
        primary_images = {}

    items_out = []
    for item in order.items:
        product = products_by_id.get(item.product_id)
        img_url = primary_images.get(item.product_id, "")
        items_out.append(
            {
                "product_id": item.product_id,
                "product_name": product.title_fr if product else "Produit",
                "product_name_ar": product.title_ar if product and product.title_ar else None,
                "product_image": img_url,
                "quantity": item.quantity,
                "unit_price": float(item.unit_price),
                "subtotal": float(item.total_price),
            }
        )
    ref = order.reference or generate_order_reference(order.id, order.created_at)
    return SellerOrderOut(
        id=order.id,
        reference=ref,
        created_at=order.created_at,
        buyer_name=buyer.full_name if buyer else "",
        buyer_phone=addr.phone if addr else "",
        buyer_address={
            "city": addr.city if addr else "",
            "address": addr.street if addr else "",
            "zip": addr.postal_code or "" if addr else "",
        },
        items=items_out,
        total_amount=float(order.total),
        payment_method=payment_method_api(order.payment_method),
        payment_status=payment_status_api(order.payment_status),
        order_status=order_status_api(order.status),
        delivery={
            "provider": "amana",
            "tracking_number": order.amana_tracking_number or order.tracking_number,
            "tracking_url": order.amana_tracking_url,
            "status": order.amana_status,
            "estimated_delivery": order.amana_estimated_delivery,
        },
    )


@router.get("", response_model=SellerOrdersListResponse)
async def list_orders(
    user: SellerUser,
    db: AsyncSession = Depends(get_db),
    status: str = Query("all"),
    payment: str = Query("all"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    q: str | None = Query(None, alias="search"),
):
    profile = await _get_profile(db, user.id)
    base = select(Order).options(selectinload(Order.items)).where(Order.seller_id == profile.id)

    if status != "all" and status in STATUS_FILTER and STATUS_FILTER[status]:
        base = base.where(Order.status == STATUS_FILTER[status])

    if payment in ("cmi", "cod"):
        pm = PAYMENT_METHOD_FROM_API[payment]
        if pm:
            base = base.where(Order.payment_method == pm)

    if q:
        pattern = f"%{q}%"
        buyer_ids = select(User.id).where(User.full_name.ilike(pattern))
        base = base.where(or_(Order.reference.ilike(pattern), Order.buyer_id.in_(buyer_ids)))

    count_base = select(Order.id).where(Order.seller_id == profile.id)
    if status != "all" and status in STATUS_FILTER and STATUS_FILTER[status]:
        count_base = count_base.where(Order.status == STATUS_FILTER[status])
    if payment in ("cmi", "cod"):
        pm = PAYMENT_METHOD_FROM_API[payment]
        if pm:
            count_base = count_base.where(Order.payment_method == pm)
    if q:
        pattern = f"%{q}%"
        buyer_ids = select(User.id).where(User.full_name.ilike(pattern))
        count_base = count_base.where(or_(Order.reference.ilike(pattern), Order.buyer_id.in_(buyer_ids)))
    total = await db.scalar(select(func.count()).select_from(count_base)) or 0

    result = await db.execute(
        base.order_by(Order.created_at.desc()).offset((page - 1) * limit).limit(limit)
    )
    orders = result.scalars().all()
    return SellerOrdersListResponse(
        total=total,
        page=page,
        orders=[await _build_order_out(db, o) for o in orders],
    )


@router.get("/counts")
async def order_counts(user: SellerUser, db: AsyncSession = Depends(get_db)):
    profile = await _get_profile(db, user.id)
    counts = {}
    for key, st in STATUS_FILTER.items():
        if key == "all":
            continue
        if not st:
            continue
        c = await db.scalar(
            select(func.count()).select_from(Order).where(Order.seller_id == profile.id, Order.status == st)
        )
        counts[key] = c or 0
    return counts


@router.get("/{order_id}", response_model=SellerOrderOut)
async def get_order(order_id: UUID, user: SellerUser, db: AsyncSession = Depends(get_db)):
    profile = await _get_profile(db, user.id)
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id, Order.seller_id == profile.id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return await _build_order_out(db, order)


@router.patch("/{order_id}/confirm", response_model=SellerOrderOut)
async def confirm_order(order_id: UUID, user: SellerUser, db: AsyncSession = Depends(get_db)):
    profile = await _get_profile(db, user.id)
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id, Order.seller_id == profile.id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status not in ("PENDING",):
        raise HTTPException(status_code=400, detail="Order cannot be confirmed")

    addr = await db.get(Address, order.address_id)
    await auto_fulfill_order(db, order, profile, addr)
    await db.flush()
    return await _build_order_out(db, order)


@router.patch("/{order_id}/cancel", response_model=SellerOrderOut)
async def cancel_order(
    order_id: UUID,
    body: CancelOrderBody,
    user: SellerUser,
    db: AsyncSession = Depends(get_db),
):
    profile = await _get_profile(db, user.id)
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id, Order.seller_id == profile.id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status in ("DELIVERED", "CANCELLED"):
        raise HTTPException(status_code=400, detail="Order cannot be cancelled")

    order.status = "CANCELLED"
    order.cancel_reason = body.reason
    ref = order.reference or generate_order_reference(order.id, order.created_at)
    notif = SellerNotificationService(db)
    await notif.notify_order_cancelled(order, ref)
    await db.flush()
    return await _build_order_out(db, order)


@router.get("/{order_id}/tracking")
async def get_tracking(order_id: UUID, user: SellerUser, db: AsyncSession = Depends(get_db)):
    profile = await _get_profile(db, user.id)
    result = await db.execute(select(Order).where(Order.id == order_id, Order.seller_id == profile.id))
    order = result.scalar_one_or_none()
    if not order or not order.amana_tracking_number:
        raise HTTPException(status_code=404, detail="Tracking not available")
    amana = AmanaService()
    tracking = await amana.get_tracking(order.amana_tracking_number)
    return {
        "tracking_number": tracking.tracking_number,
        "status": tracking.status,
        "events": tracking.events,
        "tracking_url": order.amana_tracking_url,
    }


@router.get("/{order_id}/label")
async def get_label(order_id: UUID, user: SellerUser, db: AsyncSession = Depends(get_db)):
    profile = await _get_profile(db, user.id)
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id, Order.seller_id == profile.id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status == "CANCELLED":
        raise HTTPException(status_code=400, detail="Order cancelled")

    if not order.amana_shipment_id and order.status in ("PENDING", "CONFIRMED"):
        addr = await db.get(Address, order.address_id)
        if addr:
            await auto_fulfill_order(db, order, profile, addr)
            await db.flush()

    buyer = await db.get(User, order.buyer_id)
    addr = await db.get(Address, order.address_id)
    ref = order.reference or generate_order_reference(order.id, order.created_at)

    product_ids = [item.product_id for item in order.items]
    products_by_id: dict = {}
    if product_ids:
        prod_rows = await db.execute(select(Product).where(Product.id.in_(product_ids)))
        products_by_id = {p.id: p for p in prod_rows.scalars().all()}

    item_data = []
    for item in order.items:
        product = products_by_id.get(item.product_id)
        item_data.append(
            {
                "product_name": product.title_fr if product else "Produit",
                "quantity": item.quantity,
                "subtotal": float(item.total_price),
            }
        )

    label_kwargs = dict(
        shop_name=profile.shop_name or "Artisan",
        buyer_name=buyer.full_name if buyer else "",
        buyer_phone=addr.phone if addr else "",
        address_line=addr.street if addr else "",
        city=addr.city if addr else "",
        zip_code=addr.postal_code or "" if addr else "",
        tracking_number=order.amana_tracking_number,
        items=item_data,
    )

    pdf: bytes
    if order.amana_shipment_id and AmanaService.API_KEY:
        amana = AmanaService()
        try:
            pdf = await amana.get_label_pdf(order.amana_shipment_id)
        except Exception:
            pdf = generate_delivery_label_pdf(order, **label_kwargs)
    else:
        pdf = generate_delivery_label_pdf(order, **label_kwargs)

    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="bon-{ref}.pdf"'},
    )
