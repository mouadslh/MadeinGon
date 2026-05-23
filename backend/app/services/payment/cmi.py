import hashlib
import hmac
from decimal import Decimal

from app.core.config import get_settings
from app.models.order import Order
from app.utils.order_helpers import generate_order_reference, payment_method_api

settings = get_settings()


class CMIService:
    def __init__(self):
        self.client_id = settings.CMI_CLIENT_ID
        self.store_key = settings.CMI_STORE_KEY
        self.base_url = settings.CMI_BASE_URL
        self.ok_url = settings.CMI_OK_URL
        self.fail_url = settings.CMI_FAIL_URL
        self.callback_url = settings.CMI_CALLBACK_URL

    def _compute_hash(self, fields: dict) -> str:
        ordered_keys = sorted(fields.keys())
        hash_str = "|".join(f"{k}={fields[k]}" for k in ordered_keys if fields[k])
        return hmac.new(
            self.store_key.encode("utf-8"),
            hash_str.encode("utf-8"),
            hashlib.sha512,
        ).hexdigest()

    def create_payment_request(self, order: Order) -> dict:
        ref = order.reference or generate_order_reference(order.id, order.created_at)
        amount_cents = int(order.total * 100)
        fields = {
            "clientid": self.client_id,
            "amount": str(amount_cents),
            "currency": "504",
            "oid": ref,
            "okUrl": self.ok_url,
            "failUrl": self.fail_url,
            "callbackUrl": self.callback_url,
            "storetype": "3D_PAY_HOSTING",
            "hashAlgorithm": "SHA512",
            "lang": "fr",
        }
        fields["hash"] = self._compute_hash({k: v for k, v in fields.items() if k != "hash"})
        return {"action_url": self.base_url, "fields": fields}

    def verify_callback(self, payload: dict) -> bool:
        received_hash = payload.get("HASH") or payload.get("hash")
        if not received_hash:
            raise ValueError("Missing hash in CMI callback")
        verify_fields = {k: v for k, v in payload.items() if k.upper() not in ("HASH", "HASHALGORITHM")}
        expected = self._compute_hash({k.lower(): str(v) for k, v in verify_fields.items()})
        if not hmac.compare_digest(expected.lower(), str(received_hash).lower()):
            raise ValueError("Invalid CMI signature")
        return True

    async def process_webhook(self, db, payload: dict) -> None:
        from sqlalchemy import select

        from app.services.notifications.seller_notif import SellerNotificationService
        from app.services.wallet_service import credit_sale
        from app.utils.order_helpers import generate_order_reference

        self.verify_callback(payload)
        oid = payload.get("oid") or payload.get("OID")
        proc_return = (payload.get("ProcReturnCode") or payload.get("procreturncode") or "").strip()

        result = await db.execute(select(Order).where(Order.reference == oid))
        order = result.scalar_one_or_none()
        if not order:
            return

        ref = order.reference or generate_order_reference(order.id, order.created_at)
        notif = SellerNotificationService(db)

        if proc_return == "00" or (payload.get("Response") or "").upper() == "APPROVED":
            order.payment_status = "PAID"
            from app.models.seller import SellerProfile

            profile = await db.get(SellerProfile, order.seller_id)
            seller_uid = profile.user_id if profile else None
            if seller_uid and payment_method_api(order.payment_method) == "cmi":
                await credit_sale(db, seller_uid, order, pending=False)
                await notif.notify_order_paid(order, ref)
        else:
            order.payment_status = "FAILED"
        await db.flush()
