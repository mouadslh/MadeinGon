from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class OrderItemCreate(BaseModel):
    product_id: UUID
    quantity: int = Field(ge=1)


class OrderCreate(BaseModel):
    seller_id: UUID
    address_id: UUID
    items: List[OrderItemCreate]
    payment_method: str = Field(pattern="^(COD|CARD)$")
    notes: Optional[str] = None


class OrderItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    quantity: int
    unit_price: Decimal
    total_price: Decimal

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    id: UUID
    buyer_id: UUID
    seller_id: UUID
    address_id: UUID
    status: str
    payment_method: str
    payment_status: str
    subtotal: Decimal
    shipping_fee: Decimal
    commission_amount: Decimal
    total: Decimal
    carrier: Optional[str]
    tracking_number: Optional[str]
    notes: Optional[str]
    items: List[OrderItemResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    status: str


class TrackingUpdate(BaseModel):
    carrier: str
    tracking_number: str


class DisputeCreate(BaseModel):
    reason: str
