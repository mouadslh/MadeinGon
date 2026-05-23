"""Map legacy DB values to API-facing lowercase enums."""
from datetime import datetime
from decimal import Decimal
from uuid import UUID

from app.models.order import Order

STATUS_TO_API = {
    "PENDING": "pending",
    "CONFIRMED": "confirmed",
    "SHIPPED": "shipped",
    "DELIVERED": "delivered",
    "CANCELLED": "cancelled",
    "DISPUTED": "cancelled",
}
API_TO_STATUS = {v: k for k, v in STATUS_TO_API.items() if k != "DISPUTED"}
API_TO_STATUS["cancelled"] = "CANCELLED"

PAYMENT_METHOD_TO_API = {"COD": "cod", "CARD": "cmi", "cmi": "cmi", "cod": "cod"}
PAYMENT_METHOD_FROM_API = {"cod": "COD", "cmi": "CARD", "all": None}

PAYMENT_STATUS_TO_API = {
    "UNPAID": "pending",
    "PENDING": "pending",
    "PAID": "paid",
    "FAILED": "failed",
    "REFUNDED": "refunded",
}
PAYMENT_STATUS_FROM_API = {
    "pending": "UNPAID",
    "paid": "PAID",
    "failed": "FAILED",
    "refunded": "REFUNDED",
}


def generate_order_reference(order_id: UUID, created_at: datetime | None = None) -> str:
    year = (created_at or datetime.utcnow()).year
    short = str(order_id).replace("-", "")[:8].upper()
    return f"ORD-{year}-{short}"


def order_status_api(status: str) -> str:
    return STATUS_TO_API.get(status.upper(), status.lower())


def payment_method_api(method: str) -> str:
    return PAYMENT_METHOD_TO_API.get(method.upper(), method.lower())


def payment_status_api(status: str) -> str:
    return PAYMENT_STATUS_TO_API.get(status.upper(), status.lower())


def net_order_amount(order: Order, commission_rate: Decimal = Decimal("0.05")) -> Decimal:
    gross = order.subtotal - order.commission_amount
    return (gross * (Decimal("1") - commission_rate)).quantize(Decimal("0.01"))
