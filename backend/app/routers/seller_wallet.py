import csv
import io
from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import SellerUser
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.seller import SellerProfile
from app.models.wallet import SellerWallet, WalletTransaction
from app.services.wallet_service import (
    compute_wallet_balances,
    get_or_create_wallet,
    get_wallet_stats,
    list_order_transactions,
    list_orders_for_export,
)

router = APIRouter(prefix="/seller/wallet", tags=["seller-wallet"])

PERIOD_DAYS = {"7d": 7, "30d": 30, "90d": 90, "1y": 365}


@router.get("")
async def get_wallet(
    user: SellerUser,
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
):
    profile_r = await db.execute(select(SellerProfile).where(SellerProfile.user_id == user.id))
    profile = profile_r.scalar_one_or_none()

    wallet = await get_or_create_wallet(db, user.id)

    if profile:
        balances = await compute_wallet_balances(db, profile)
        total_earned = balances["total_earned"]
        total_pending = balances["total_pending"]
        available = balances["available"]
    else:
        total_earned = float(wallet.total_earned)
        total_pending = float(wallet.total_pending)
        available = float(wallet.available)

    total_tx = await db.scalar(
        select(func.count()).select_from(WalletTransaction).where(WalletTransaction.seller_id == user.id)
    ) or 0

    transactions = []
    total_pages = 1

    if total_tx > 0:
        total_pages = max(1, (total_tx + limit - 1) // limit)
        tx_result = await db.execute(
            select(WalletTransaction)
            .where(WalletTransaction.seller_id == user.id)
            .order_by(WalletTransaction.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
        )
        for tx in tx_result.scalars().all():
            products = []
            if tx.order_id:
                items_r = await db.execute(
                    select(Product.title_fr)
                    .join(OrderItem, OrderItem.product_id == Product.id)
                    .where(OrderItem.order_id == tx.order_id)
                )
                products = [row[0] for row in items_r.all()]
            transactions.append({
                "id": str(tx.id),
                "order_id": str(tx.order_id) if tx.order_id else None,
                "type": tx.type,
                "amount": float(tx.amount),
                "description": tx.description,
                "products": products,
                "created_at": tx.created_at.isoformat(),
            })
    elif profile:
        transactions, order_total = await list_order_transactions(
            db, profile, limit=limit, offset=(page - 1) * limit
        )
        total_pages = max(1, (order_total + limit - 1) // limit)

    return {
        "total_earned": total_earned,
        "total_pending": total_pending,
        "available": available,
        "total_paid_out": float(wallet.total_paid_out),
        "transactions": transactions,
        "page": page,
        "total_pages": total_pages,
    }


@router.get("/stats")
async def wallet_stats(
    user: SellerUser,
    db: AsyncSession = Depends(get_db),
    period: str = Query("30d"),
):
    profile_r = await db.execute(select(SellerProfile).where(SellerProfile.user_id == user.id))
    profile = profile_r.scalar_one_or_none()
    if not profile:
        return {"revenue_by_day": [], "top_products": [], "orders_count": 0, "avg_order_value": 0, "revenue_total": 0, "growth_vs_prev": 0}
    days = PERIOD_DAYS.get(period, 30)
    return await get_wallet_stats(db, profile, user.id, days)


@router.get("/export")
async def export_wallet(
    user: SellerUser,
    db: AsyncSession = Depends(get_db),
    format: str = Query("csv"),
    period: str = Query("30d"),
):
    days = PERIOD_DAYS.get(period, 30)
    since = datetime.now(timezone.utc) - timedelta(days=days)

    profile_r = await db.execute(select(SellerProfile).where(SellerProfile.user_id == user.id))
    profile = profile_r.scalar_one_or_none()

    output = io.StringIO()
    writer = csv.writer(output)

    wallet_rows = await db.execute(
        select(WalletTransaction)
        .where(WalletTransaction.seller_id == user.id, WalletTransaction.created_at >= since)
        .order_by(WalletTransaction.created_at.desc())
    )
    txs = wallet_rows.scalars().all()

    if txs:
        writer.writerow(["date", "type", "order_id", "amount", "description"])
        for tx in txs:
            writer.writerow([
                tx.created_at.isoformat(),
                tx.type,
                str(tx.order_id) if tx.order_id else "",
                float(tx.amount),
                tx.description or "",
            ])
    elif profile:
        order_rows = await list_orders_for_export(db, profile, since)
        writer.writerow(["date", "reference", "status", "products", "amount", "payment_method", "order_id"])
        for row in order_rows:
            writer.writerow([
                row["date"],
                row["reference"],
                row["status"],
                row["products"],
                row["amount"],
                row["payment_method"],
                row["order_id"],
            ])
    else:
        writer.writerow(["date", "reference", "status", "products", "amount", "payment_method", "order_id"])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=wallet-{period}.csv"},
    )
