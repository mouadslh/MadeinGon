import csv
import io
from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.core.deps import SellerUser
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.seller import SellerProfile
from app.models.wallet import SellerWallet, WalletTransaction
from app.services.wallet_service import get_or_create_wallet, get_wallet_stats

router = APIRouter(prefix="/seller/wallet", tags=["seller-wallet"])
settings = get_settings()

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
    commission_rate = float(profile.commission_rate / 100) if profile else settings.PLATFORM_COMMISSION_RATE

    wallet = await get_or_create_wallet(db, user.id)
    total_tx = await db.scalar(
        select(func.count()).select_from(WalletTransaction).where(WalletTransaction.seller_id == user.id)
    ) or 0
    total_pages = max(1, (total_tx + limit - 1) // limit)

    tx_result = await db.execute(
        select(WalletTransaction)
        .where(WalletTransaction.seller_id == user.id)
        .order_by(WalletTransaction.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    transactions = []
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
            "commission_rate": float(tx.commission_rate),
            "net_amount": float(tx.net_amount),
            "description": tx.description,
            "products": products,
            "created_at": tx.created_at.isoformat(),
        })

    return {
        "total_earned": float(wallet.total_earned),
        "total_pending": float(wallet.total_pending),
        "available": float(wallet.available),
        "total_paid_out": float(wallet.total_paid_out),
        "commission_rate": commission_rate,
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
    result = await db.execute(
        select(WalletTransaction)
        .where(WalletTransaction.seller_id == user.id, WalletTransaction.created_at >= since)
        .order_by(WalletTransaction.created_at.desc())
    )
    rows = result.scalars().all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["date", "type", "order_id", "amount", "commission_rate", "net_amount", "description"])
    for tx in rows:
        writer.writerow([
            tx.created_at.isoformat(),
            tx.type,
            str(tx.order_id) if tx.order_id else "",
            float(tx.amount),
            float(tx.commission_rate),
            float(tx.net_amount),
            tx.description or "",
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=wallet-{period}.csv"},
    )
