from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class BuyerAddressOut(BaseModel):
    city: str
    address: str
    zip: str = ""


class OrderItemOut(BaseModel):
    product_id: UUID
    product_name: str
    product_image: str = ""
    quantity: int
    unit_price: float
    subtotal: float


class DeliveryOut(BaseModel):
    provider: str = "amana"
    tracking_number: Optional[str] = None
    tracking_url: Optional[str] = None
    status: Optional[str] = None
    estimated_delivery: Optional[date] = None


class SellerOrderOut(BaseModel):
    id: UUID
    reference: str
    created_at: datetime
    buyer_name: str
    buyer_phone: str
    buyer_address: BuyerAddressOut
    items: List[OrderItemOut]
    total_amount: float
    payment_method: str
    payment_status: str
    order_status: str
    delivery: DeliveryOut


class SellerOrdersListResponse(BaseModel):
    total: int
    page: int
    orders: List[SellerOrderOut]


class CancelOrderBody(BaseModel):
    reason: str = Field(min_length=1, max_length=500)
