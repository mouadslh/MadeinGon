from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import BuyerUser, SellerUser
from app.models.address import Address
from app.models.dispute import Dispute
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.seller import SellerProfile
from app.schemas.order import (
    DisputeCreate,
    OrderCreate,
    OrderResponse,
    OrderStatusUpdate,
    TrackingUpdate,
)
from app.services.delivery.fulfill import auto_fulfill_order
from app.services.notifications.seller_notif import SellerNotificationService, check_stock_after_sale
from app.utils.order_helpers import generate_order_reference

router = APIRouter(prefix="/orders", tags=["orders"])

SHIPPING_FEE = Decimal("30.00")


def _order_response(order: Order) -> OrderResponse:
    return OrderResponse.model_validate(order)


@router.post("", response_model=OrderResponse, status_code=201)
async def create_order(data: OrderCreate, user: BuyerUser, db: AsyncSession = Depends(get_db)):
    addr = await db.get(Address, data.address_id)
    if not addr or addr.user_id != user.id:
        raise HTTPException(status_code=400, detail="Invalid address")
    profile = await db.get(SellerProfile, data.seller_id)
    if not profile:
        raise HTTPException(status_code=400, detail="Invalid seller")

    subtotal = Decimal("0")
    order_items = []
    for item in data.items:
        product = await db.get(Product, item.product_id)
        if not product or product.seller_id != profile.id or not product.is_active:
            raise HTTPException(status_code=400, detail=f"Invalid product {item.product_id}")
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.title_fr}")
        line_total = product.price * item.quantity
        subtotal += line_total
        order_items.append((product, item.quantity, product.price, line_total))
        product.stock -= item.quantity

    commission_amount = Decimal("0")
    total = subtotal + SHIPPING_FEE

    order = Order(
        buyer_id=user.id,
        seller_id=profile.id,
        address_id=data.address_id,
        payment_method=data.payment_method,
        subtotal=subtotal,
        shipping_fee=SHIPPING_FEE,
        commission_amount=commission_amount,
        total=total,
        notes=data.notes,
        status="PENDING",
        payment_status="UNPAID" if data.payment_method == "COD" else "UNPAID",
    )
    db.add(order)
    await db.flush()
    order.reference = generate_order_reference(order.id, order.created_at)

    for product, qty, unit, line in order_items:
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=qty,
                unit_price=unit,
                total_price=line,
            )
        )

    notif = SellerNotificationService(db)
    await notif.notify_new_order(order, order.reference)

    for product, qty, _, _ in order_items:
        await check_stock_after_sale(db, product.id)

    await auto_fulfill_order(db, order, profile, addr)

    await db.flush()
    await db.refresh(order, ["items"])
    return _order_response(order)


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: UUID, user: BuyerUser, db: AsyncSession = Depends(get_db)):
    order = await _get_order(db, order_id, user)
    return _order_response(order)


@router.get("/buyer/history", response_model=list[OrderResponse])
async def buyer_history(user: BuyerUser, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.buyer_id == user.id).order_by(Order.created_at.desc())
    )
    return [_order_response(o) for o in result.scalars().all()]


@router.get("/seller/incoming", response_model=list[OrderResponse])
async def seller_incoming(user: SellerUser, db: AsyncSession = Depends(get_db)):
    profile = await db.execute(select(SellerProfile).where(SellerProfile.user_id == user.id))
    sp = profile.scalar_one_or_none()
    if not sp:
        raise HTTPException(status_code=404, detail="Seller profile not found")
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.seller_id == sp.id).order_by(Order.created_at.desc())
    )
    return [_order_response(o) for o in result.scalars().all()]


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_status(
    order_id: UUID, data: OrderStatusUpdate, user: SellerUser, db: AsyncSession = Depends(get_db)
):
    order = await _get_order_seller(db, order_id, user)
    order.status = data.status
    await db.flush()
    await db.refresh(order, ["items"])
    return _order_response(order)


@router.post("/{order_id}/tracking", response_model=OrderResponse)
async def add_tracking(
    order_id: UUID, data: TrackingUpdate, user: SellerUser, db: AsyncSession = Depends(get_db)
):
    order = await _get_order_seller(db, order_id, user)
    order.carrier = data.carrier
    order.tracking_number = data.tracking_number
    order.status = "SHIPPED"
    await db.flush()
    await db.refresh(order, ["items"])
    return _order_response(order)


@router.post("/{order_id}/dispute", status_code=201)
async def open_dispute(
    order_id: UUID, data: DisputeCreate, user: BuyerUser, db: AsyncSession = Depends(get_db)
):
    order = await _get_order(db, order_id, user)
    if order.buyer_id != user.id:
        raise HTTPException(status_code=403, detail="Not your order")
    existing = await db.execute(select(Dispute).where(Dispute.order_id == order_id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Dispute already exists")
    dispute = Dispute(order_id=order_id, opened_by=user.id, reason=data.reason)
    order.status = "DISPUTED"
    db.add(dispute)
    return {"message": "Dispute opened"}


async def _get_order(db: AsyncSession, order_id: UUID, user) -> Order:
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.buyer_id != user.id and user.role not in ("SELLER", "ADMIN"):
        raise HTTPException(status_code=403, detail="Forbidden")
    if user.role == "SELLER":
        profile = await db.execute(select(SellerProfile).where(SellerProfile.user_id == user.id))
        sp = profile.scalar_one_or_none()
        if not sp or order.seller_id != sp.id:
            raise HTTPException(status_code=403, detail="Forbidden")
    return order


async def _get_order_seller(db: AsyncSession, order_id: UUID, user) -> Order:
    profile = await db.execute(select(SellerProfile).where(SellerProfile.user_id == user.id))
    sp = profile.scalar_one_or_none()
    if not sp:
        raise HTTPException(status_code=403, detail="Not a seller")
    result = await db.execute(
        select(Order).options(selectinload(Order.items)).where(Order.id == order_id, Order.seller_id == sp.id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
