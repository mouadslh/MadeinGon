import hashlib
import hmac
from dataclasses import dataclass
from decimal import Decimal

import httpx

from app.core.config import get_settings
from app.models.address import Address
from app.models.order import Order
from app.models.seller import SellerProfile
from app.models.user import User
from app.utils.order_helpers import generate_order_reference, payment_method_api

settings = get_settings()

AMANA_STATUS_MAP = {
    "created": "pending",
    "picked_up": "in_transit",
    "in_transit": "in_transit",
    "out_for_delivery": "out_for_delivery",
    "delivered": "delivered",
    "failed": "failed",
    "cancelled": "failed",
}


@dataclass
class AmanaShipment:
    shipment_id: str
    tracking_number: str
    tracking_url: str
    label_url: str | None = None


@dataclass
class AmanaTracking:
    tracking_number: str
    status: str
    events: list[dict]


class AmanaService:
    BASE_URL = settings.AMANA_API_URL
    API_KEY = settings.AMANA_API_KEY
    WEBHOOK_SECRET = settings.AMANA_WEBHOOK_SECRET

    def _headers(self) -> dict:
        return {"Authorization": f"Bearer {self.API_KEY}", "Content-Type": "application/json"}

    async def create_shipment(self, order: Order, profile: SellerProfile, address: Address) -> AmanaShipment:
        ref = order.reference or generate_order_reference(order.id, order.created_at)
        seller_user = None
        cod = payment_method_api(order.payment_method) == "cod"
        payload = {
            "reference": ref,
            "sender": {
                "name": profile.shop_name,
                "phone": "",
                "address": profile.city,
                "city": profile.city,
            },
            "recipient": {
                "name": address.full_name,
                "phone": address.phone,
                "address": address.street,
                "city": address.city,
            },
            "parcel": {
                "weight": 1.0,
                "description": "Artisanat Guelmim",
                "value": float(order.total),
            },
            "cod_amount": float(order.total) if cod else 0,
            "service_type": "standard",
        }

        if not self.API_KEY:
            tracking = f"AM{ref[-8:]}"
            return AmanaShipment(
                shipment_id=f"SANDBOX-{order.id.hex[:12]}",
                tracking_number=tracking,
                tracking_url=f"https://track-sandbox.amana.ma/{tracking}",
                label_url=None,
            )

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(f"{self.BASE_URL}/shipments", json=payload, headers=self._headers())
            resp.raise_for_status()
            data = resp.json()
            return AmanaShipment(
                shipment_id=data.get("id", data.get("shipment_id", "")),
                tracking_number=data.get("tracking_number", ""),
                tracking_url=data.get("tracking_url", ""),
                label_url=data.get("label_url"),
            )

    async def get_tracking(self, tracking_number: str) -> AmanaTracking:
        if not self.API_KEY:
            return AmanaTracking(
                tracking_number=tracking_number,
                status="in_transit",
                events=[
                    {"status": "created", "label": "Créé", "at": ""},
                    {"status": "in_transit", "label": "En transit", "at": ""},
                ],
            )
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(
                f"{self.BASE_URL}/shipments/{tracking_number}/tracking",
                headers=self._headers(),
            )
            resp.raise_for_status()
            data = resp.json()
            status = AMANA_STATUS_MAP.get(data.get("status", "in_transit"), data.get("status", "in_transit"))
            return AmanaTracking(
                tracking_number=tracking_number,
                status=status,
                events=data.get("events", []),
            )

    async def get_label_pdf(self, shipment_id: str) -> bytes:
        if not self.API_KEY:
            return b"%PDF-1.4\n% Mock Amana label\n"
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(
                f"{self.BASE_URL}/shipments/{shipment_id}/label",
                headers=self._headers(),
            )
            resp.raise_for_status()
            return resp.content

    async def cancel_shipment(self, shipment_id: str) -> bool:
        if not self.API_KEY:
            return True
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.delete(
                f"{self.BASE_URL}/shipments/{shipment_id}",
                headers=self._headers(),
            )
            return resp.status_code in (200, 204)

    def verify_webhook_signature(self, payload: bytes, signature: str | None) -> bool:
        if not self.WEBHOOK_SECRET:
            return True
        if not signature:
            return False
        expected = hmac.new(
            self.WEBHOOK_SECRET.encode(),
            payload,
            hashlib.sha256,
        ).hexdigest()
        return hmac.compare_digest(expected, signature)

    async def handle_webhook(self, db, payload: dict) -> None:
        from sqlalchemy import select

        from app.services.notifications.seller_notif import SellerNotificationService
        from app.services.wallet_service import credit_sale
        from app.utils.order_helpers import generate_order_reference, net_order_amount

        tracking = payload.get("tracking_number") or payload.get("trackingNumber")
        status = (payload.get("status") or "").lower()
        shipment_id = payload.get("shipment_id") or payload.get("shipmentId")

        q = select(Order)
        if tracking:
            q = q.where(
                (Order.amana_tracking_number == tracking) | (Order.tracking_number == tracking)
            )
        elif shipment_id:
            q = q.where(Order.amana_shipment_id == shipment_id)
        else:
            return

        result = await db.execute(q)
        order = result.scalar_one_or_none()
        if not order:
            return

        mapped = AMANA_STATUS_MAP.get(status, status)
        order.amana_status = mapped
        ref = order.reference or generate_order_reference(order.id, order.created_at)
        notif = SellerNotificationService(db)

        if mapped == "in_transit" and order.status == "CONFIRMED":
            order.status = "SHIPPED"
            order.carrier = "amana"
            await notif.notify_order_shipped(order, order.amana_tracking_number or tracking or "")

        if mapped == "delivered":
            order.status = "DELIVERED"
            await notif.notify_order_delivered(order, ref)
            if payment_method_api(order.payment_method) == "cod":
                order.payment_status = "PAID"
                profile = await db.get(SellerProfile, order.seller_id)
                if profile:
                    await credit_sale(db, profile.user_id, order, pending=False)
            elif order.payment_status == "PAID":
                profile = await db.get(SellerProfile, order.seller_id)
                if profile:
                    await credit_sale(db, profile.user_id, order, pending=False)

        await db.flush()
