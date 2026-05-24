from datetime import date, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.address import Address
from app.models.order import Order
from app.models.seller import SellerProfile
from app.services.delivery.amana import AmanaService
from app.services.notifications.seller_notif import SellerNotificationService
from app.utils.order_helpers import generate_order_reference


async def auto_fulfill_order(
    db: AsyncSession,
    order: Order,
    profile: SellerProfile,
    address: Address,
) -> None:
    """Shopify-style: confirm order and create Amana shipment immediately on checkout."""
    if not order.reference:
        order.reference = generate_order_reference(order.id, order.created_at)

    amana = AmanaService()
    shipment = await amana.create_shipment(order, profile, address)

    order.status = "CONFIRMED"
    order.carrier = "amana"
    order.amana_shipment_id = shipment.shipment_id
    order.amana_tracking_number = shipment.tracking_number
    order.amana_tracking_url = shipment.tracking_url
    order.tracking_number = shipment.tracking_number
    order.amana_status = "pending"
    order.amana_estimated_delivery = date.today() + timedelta(days=3)

    notif = SellerNotificationService(db)
    await notif.notify_order_shipped(order, shipment.tracking_number)
