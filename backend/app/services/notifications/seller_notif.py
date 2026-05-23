import json
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.redis_client import get_redis
from app.models.notification import Notification
from app.models.order import Order
from app.models.product import Product
from app.models.seller import SellerProfile


class SellerNotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def send(
        self,
        seller_id: UUID,
        type: str,
        title: str,
        body: str,
        data: dict | None = None,
    ) -> Notification:
        notif = Notification(
            seller_id=seller_id,
            type=type,
            title=title,
            body=body,
            data=data,
        )
        self.db.add(notif)
        await self.db.flush()

        try:
            r = await get_redis()
            payload = {
                "id": str(notif.id),
                "type": type,
                "title": title,
                "body": body,
                "data": data,
                "created_at": notif.created_at.isoformat(),
            }
            await r.publish(f"notif:{seller_id}", json.dumps(payload))
        except Exception:
            pass
        return notif

    async def _seller_user_id_for_profile(self, profile_id: UUID) -> UUID | None:
        from sqlalchemy import select

        result = await self.db.execute(select(SellerProfile.user_id).where(SellerProfile.id == profile_id))
        row = result.first()
        return row[0] if row else None

    async def notify_new_order(self, order: Order, reference: str) -> None:
        uid = await self._seller_user_id_for_profile(order.seller_id)
        if not uid:
            return
        await self.send(
            uid,
            "new_order",
            "Nouvelle commande",
            f"Commande {reference} reçue",
            {"order_id": str(order.id)},
        )

    async def notify_order_paid(self, order: Order, reference: str) -> None:
        uid = await self._seller_user_id_for_profile(order.seller_id)
        if not uid:
            return
        await self.send(
            uid,
            "order_paid",
            "Paiement confirmé",
            f"Commande {reference} payée",
            {"order_id": str(order.id)},
        )

    async def notify_order_shipped(self, order: Order, tracking: str) -> None:
        uid = await self._seller_user_id_for_profile(order.seller_id)
        if not uid:
            return
        await self.send(
            uid,
            "order_shipped",
            "Envoi créé",
            f"Suivi : {tracking}",
            {"order_id": str(order.id), "tracking_number": tracking},
        )

    async def notify_order_delivered(self, order: Order, reference: str) -> None:
        uid = await self._seller_user_id_for_profile(order.seller_id)
        if not uid:
            return
        await self.send(
            uid,
            "order_delivered",
            "Commande livrée",
            f"Commande {reference} livrée",
            {"order_id": str(order.id)},
        )

    async def notify_order_cancelled(self, order: Order, reference: str) -> None:
        uid = await self._seller_user_id_for_profile(order.seller_id)
        if not uid:
            return
        await self.send(
            uid,
            "order_cancelled",
            "Commande annulée",
            f"Commande {reference} annulée",
            {"order_id": str(order.id)},
        )

    async def notify_low_stock(self, product: Product, current_stock: int) -> None:
        from sqlalchemy import select

        result = await self.db.execute(
            select(SellerProfile.user_id).where(SellerProfile.id == product.seller_id)
        )
        uid = result.scalar_one_or_none()
        if not uid:
            return
        await self.send(
            uid,
            "low_stock",
            "Stock bas",
            f"{product.title_fr} : {current_stock} restant(s)",
            {"product_id": str(product.id)},
        )

    async def notify_out_of_stock(self, product: Product) -> None:
        from sqlalchemy import select

        result = await self.db.execute(
            select(SellerProfile.user_id).where(SellerProfile.id == product.seller_id)
        )
        uid = result.scalar_one_or_none()
        if not uid:
            return
        await self.send(
            uid,
            "out_of_stock",
            "Stock épuisé",
            f"{product.title_fr} est en rupture",
            {"product_id": str(product.id)},
        )

    async def notify_product_approved(self, product: Product) -> None:
        from sqlalchemy import select

        result = await self.db.execute(
            select(SellerProfile.user_id).where(SellerProfile.id == product.seller_id)
        )
        uid = result.scalar_one_or_none()
        if not uid:
            return
        await self.send(
            uid,
            "product_approved",
            "Produit approuvé",
            f"{product.title_fr} est en ligne",
            {"product_id": str(product.id)},
        )

    async def notify_product_rejected(self, product: Product, reason: str) -> None:
        from sqlalchemy import select

        result = await self.db.execute(
            select(SellerProfile.user_id).where(SellerProfile.id == product.seller_id)
        )
        uid = result.scalar_one_or_none()
        if not uid:
            return
        await self.send(
            uid,
            "product_rejected",
            "Produit rejeté",
            reason or f"{product.title_fr} nécessite des modifications",
            {"product_id": str(product.id)},
        )


async def check_stock_after_sale(db: AsyncSession, product_id: UUID) -> None:
    product = await db.get(Product, product_id)
    if not product:
        return
    notif = SellerNotificationService(db)
    if product.stock == 0 and not product.stock_alert_sent:
        await notif.notify_out_of_stock(product)
        product.stock_alert_sent = True
    elif product.stock <= product.low_stock_threshold and not product.stock_alert_sent:
        await notif.notify_low_stock(product, product.stock)
        product.stock_alert_sent = True
    elif product.stock > product.low_stock_threshold:
        product.stock_alert_sent = False
    await db.flush()
