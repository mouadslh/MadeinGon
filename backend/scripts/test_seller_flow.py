"""End-to-end seller flow test. Run: docker compose exec backend python -m scripts.test_seller_flow"""
import asyncio
import sys
from decimal import Decimal
from pathlib import Path
from uuid import uuid4

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models.address import Address
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.seller import SellerProfile
from app.models.user import User
from app.models.notification import Notification
from app.models.wallet import SellerWallet, WalletTransaction
from app.services.delivery.amana import AmanaService
from app.services.notifications.seller_notif import SellerNotificationService
from app.utils.order_helpers import generate_order_reference


async def run():
    async with AsyncSessionLocal() as db:
        seller_user = (
            await db.execute(select(User).where(User.email == "artisan@madeingoun.ma"))
        ).scalar_one_or_none()
        profile = (
            await db.execute(select(SellerProfile).where(SellerProfile.user_id == seller_user.id))
        ).scalar_one_or_none()

        buyer = (
            await db.execute(select(User).where(User.email == "buyer-test@madeingoun.ma"))
        ).scalar_one_or_none()
        if not buyer:
            buyer = User(
                email="buyer-test@madeingoun.ma",
                password_hash=hash_password("buyer12345"),
                full_name="Acheteur Test",
                role="USER",
                phone="+212600000099",
                seller_status="active",
            )
            db.add(buyer)
            await db.flush()

        addr = (
            await db.execute(select(Address).where(Address.user_id == buyer.id).limit(1))
        ).scalar_one_or_none()
        if not addr:
            addr = Address(
                user_id=buyer.id,
                full_name="Acheteur Test",
                phone="+212600000099",
                street="12 Rue Artisanat",
                city="Guelmim",
                postal_code="81000",
                is_default=True,
            )
            db.add(addr)
            await db.flush()

        product = (
            await db.execute(
                select(Product).where(Product.seller_id == profile.id, Product.is_active.is_(True)).limit(1)
            )
        ).scalar_one_or_none()
        if not product:
            print("FAIL: no product for seller")
            return 1

        if seller_user.seller_status != "active":
            seller_user.seller_status = "active"

        order = Order(
            buyer_id=buyer.id,
            seller_id=profile.id,
            address_id=addr.id,
            payment_method="COD",
            subtotal=product.price,
            shipping_fee=Decimal("30.00"),
            commission_amount=Decimal("0"),
            total=product.price + Decimal("30.00"),
            status="PENDING",
            payment_status="UNPAID",
        )
        db.add(order)
        await db.flush()
        order.reference = generate_order_reference(order.id, order.created_at)
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=1,
                unit_price=product.price,
                total_price=product.price,
            )
        )
        product.stock = max(0, product.stock - 1)

        notif = SellerNotificationService(db)
        await notif.notify_new_order(order, order.reference)
        await db.commit()

        print(f"OK order created: {order.reference} id={order.id}")

        # Confirm order (Amana)
        addr2 = await db.get(Address, order.address_id)
        profile2 = await db.get(SellerProfile, order.seller_id)
        amana = AmanaService()
        shipment = await amana.create_shipment(order, profile2, addr2)
        order.status = "CONFIRMED"
        order.carrier = "amana"
        order.amana_shipment_id = shipment.shipment_id
        order.amana_tracking_number = shipment.tracking_number
        order.amana_tracking_url = shipment.tracking_url
        order.amana_status = "pending"
        await notif.notify_order_shipped(order, shipment.tracking_number)
        await db.commit()

        print(f"OK confirmed, tracking={shipment.tracking_number}")

        # Simulate delivery webhook
        await amana.handle_webhook(
            db,
            {"tracking_number": shipment.tracking_number, "status": "delivered"},
        )
        await db.commit()
        await db.refresh(order)

        print(f"OK delivered, payment_status={order.payment_status}")

        notifs = (
            await db.execute(
                select(Notification).where(Notification.seller_id == seller_user.id)
            )
        ).scalars().all()
        print(f"OK notifications count={len(notifs)} types={[n.type for n in notifs]}")

        wallet = (
            await db.execute(select(SellerWallet).where(SellerWallet.seller_id == seller_user.id))
        ).scalar_one_or_none()
        txs = (
            await db.execute(
                select(WalletTransaction).where(WalletTransaction.seller_id == seller_user.id)
            )
        ).scalars().all()
        print(f"OK wallet available={wallet.available if wallet else 0} txs={len(txs)}")

    print("ALL FLOW TESTS PASSED")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(run()))
