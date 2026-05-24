from datetime import datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.seller import SellerProfile
from app.models.wallet import SellerWallet, WalletTransaction
from app.utils.order_helpers import net_order_amount

DEFAULT_COMMISSION = Decimal("0")

ACTIVE_SALE_STATUSES = ("PENDING", "CONFIRMED", "SHIPPED", "DELIVERED")
PENDING_SALE_STATUSES = ("PENDING", "CONFIRMED", "SHIPPED")


async def compute_wallet_balances(db: AsyncSession, profile: SellerProfile) -> dict[str, float]:
    """Derive wallet totals from real orders (source of truth for seller UI)."""
    seller_filter = Order.seller_id == profile.id
    active = Order.status.in_(ACTIVE_SALE_STATUSES)

    total_earned = await db.scalar(
        select(func.coalesce(func.sum(Order.subtotal), 0)).where(seller_filter, active)
    )
    available = await db.scalar(
        select(func.coalesce(func.sum(Order.subtotal), 0)).where(
            seller_filter, Order.status == "DELIVERED"
        )
    )
    pending = await db.scalar(
        select(func.coalesce(func.sum(Order.subtotal), 0)).where(
            seller_filter, Order.status.in_(PENDING_SALE_STATUSES)
        )
    )
    return {
        "total_earned": float(total_earned or 0),
        "available": float(available or 0),
        "total_pending": float(pending or 0),
    }


async def list_order_transactions(
    db: AsyncSession, profile: SellerProfile, limit: int = 10, offset: int = 0
) -> tuple[list[dict], int]:
    """Build transaction history from orders when wallet txs are missing."""
    base = (
        select(Order)
        .where(Order.seller_id == profile.id, Order.status.in_(ACTIVE_SALE_STATUSES))
        .order_by(Order.created_at.desc())
    )
    total = await db.scalar(
        select(func.count()).select_from(Order).where(
            Order.seller_id == profile.id, Order.status.in_(ACTIVE_SALE_STATUSES)
        )
    ) or 0
    result = await db.execute(base.offset(offset).limit(limit))
    orders = result.scalars().all()

    items = []
    for order in orders:
        items_r = await db.execute(
            select(Product.title_fr)
            .join(OrderItem, OrderItem.product_id == Product.id)
            .where(OrderItem.order_id == order.id)
        )
        products = [row[0] for row in items_r.all()]
        ref = order.reference or str(order.id)[:8]
        items.append({
            "id": str(order.id),
            "order_id": str(order.id),
            "type": "sale",
            "amount": float(order.subtotal),
            "description": f"Vente {ref}",
            "products": products,
            "created_at": order.created_at.isoformat(),
            "status": order.status.lower(),
        })
    return items, total


async def list_orders_for_export(
    db: AsyncSession, profile: SellerProfile, since: datetime | None = None
) -> list[dict]:
    """All sales rows for CSV export, sourced from orders."""
    q = (
        select(Order)
        .where(Order.seller_id == profile.id, Order.status.in_(ACTIVE_SALE_STATUSES))
        .order_by(Order.created_at.desc())
    )
    if since:
        q = q.where(Order.created_at >= since)

    result = await db.execute(q)
    orders = result.scalars().all()
    rows = []
    for order in orders:
        items_r = await db.execute(
            select(Product.title_fr)
            .join(OrderItem, OrderItem.product_id == Product.id)
            .where(OrderItem.order_id == order.id)
        )
        products = ", ".join(row[0] for row in items_r.all())
        ref = order.reference or str(order.id)[:8]
        rows.append({
            "date": order.created_at.isoformat(),
            "reference": ref,
            "status": order.status.lower(),
            "products": products,
            "amount": float(order.subtotal),
            "payment_method": (order.payment_method or "").lower(),
            "order_id": str(order.id),
            "description": f"Vente {ref}",
        })
    return rows


async def get_or_create_wallet(db: AsyncSession, seller_user_id: UUID) -> SellerWallet:
    result = await db.execute(select(SellerWallet).where(SellerWallet.seller_id == seller_user_id))
    wallet = result.scalar_one_or_none()
    if wallet:
        return wallet
    wallet = SellerWallet(seller_id=seller_user_id)
    db.add(wallet)
    await db.flush()
    return wallet


async def credit_sale(
    db: AsyncSession,
    seller_user_id: UUID,
    order: Order,
    commission_rate: Decimal = DEFAULT_COMMISSION,
    pending: bool = False,
) -> WalletTransaction:
    wallet = await get_or_create_wallet(db, seller_user_id)
    gross = order.subtotal
    net = net_order_amount(order)

    tx = WalletTransaction(
        seller_id=seller_user_id,
        order_id=order.id,
        type="sale",
        amount=gross,
        commission_rate=Decimal("0"),
        net_amount=net,
        description=f"Vente {order.reference or order.id}",
    )
    db.add(tx)

    wallet.total_earned += gross
    if pending:
        wallet.total_pending += net
    else:
        wallet.available += net
    await db.flush()
    return tx


async def move_pending_to_available(db: AsyncSession, seller_user_id: UUID, amount: Decimal) -> None:
    wallet = await get_or_create_wallet(db, seller_user_id)
    wallet.total_pending = max(Decimal("0"), wallet.total_pending - amount)
    wallet.available += amount


async def get_wallet_stats(
    db: AsyncSession,
    profile: SellerProfile,
    seller_user_id: UUID,
    period_days: int,
) -> dict:
    from datetime import datetime, timedelta, timezone

    since = datetime.now(timezone.utc) - timedelta(days=period_days)
    prev_since = since - timedelta(days=period_days)

    # Count confirmed sales (incl. COD en cours), not only payment_status=PAID
    sales_filter = Order.status.in_(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"])
    seller_filter = Order.seller_id == profile.id

    revenue_q = await db.execute(
        select(func.coalesce(func.sum(Order.subtotal), 0)).where(
            seller_filter, sales_filter, Order.created_at >= since
        )
    )
    revenue_total = float(revenue_q.scalar() or 0)

    prev_revenue_q = await db.execute(
        select(func.coalesce(func.sum(Order.subtotal), 0)).where(
            seller_filter, sales_filter, Order.created_at >= prev_since, Order.created_at < since
        )
    )
    prev_revenue = float(prev_revenue_q.scalar() or 0)
    growth = ((revenue_total - prev_revenue) / prev_revenue * 100) if prev_revenue else 0.0

    orders_count_q = await db.execute(
        select(func.count()).select_from(Order).where(seller_filter, sales_filter, Order.created_at >= since)
    )
    orders_count = orders_count_q.scalar() or 0
    avg_order_value = revenue_total / orders_count if orders_count else 0.0

    by_day_rows = await db.execute(
        select(
            func.date_trunc("day", Order.created_at).label("day"),
            func.sum(Order.subtotal).label("amount"),
        )
        .where(seller_filter, sales_filter, Order.created_at >= since)
        .group_by("day")
        .order_by("day")
    )
    revenue_by_day = [
        {"date": row.day.strftime("%Y-%m-%d"), "amount": float(row.amount or 0)}
        for row in by_day_rows.all()
    ]

    top_rows = await db.execute(
        select(
            Product.title_fr,
            func.sum(OrderItem.total_price).label("revenue"),
            func.sum(OrderItem.quantity).label("units"),
        )
        .join(OrderItem, OrderItem.product_id == Product.id)
        .join(Order, Order.id == OrderItem.order_id)
        .where(seller_filter, sales_filter, Order.created_at >= since)
        .group_by(Product.id, Product.title_fr)
        .order_by(func.sum(OrderItem.total_price).desc())
        .limit(5)
    )
    top_products = [
        {
            "product_name": row.title_fr,
            "revenue": float(row.revenue or 0),
            "units_sold": int(row.units or 0),
        }
        for row in top_rows.all()
    ]

    return {
        "revenue_by_day": revenue_by_day,
        "top_products": top_products,
        "orders_count": orders_count,
        "avg_order_value": round(avg_order_value, 2),
        "revenue_total": round(revenue_total, 2),
        "growth_vs_prev": round(growth, 2),
    }
