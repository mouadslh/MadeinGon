from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ProductImageResponse(BaseModel):
    url: str
    is_primary: bool = False
    ai_enhanced: bool = False
    sort_order: int = 0

    model_config = {"from_attributes": True}


class ProductCreate(BaseModel):
    category_id: int
    title_fr: str
    title_ar: Optional[str] = None
    description_fr: Optional[str] = None
    description_ar: Optional[str] = None
    price: Decimal
    stock: int = 0
    lead_time_days: Optional[int] = None
    keywords: Optional[List[str]] = None
    image_urls: List[str] = Field(default_factory=list)


class ProductUpdate(BaseModel):
    category_id: Optional[int] = None
    title_fr: Optional[str] = None
    title_ar: Optional[str] = None
    description_fr: Optional[str] = None
    description_ar: Optional[str] = None
    price: Optional[Decimal] = None
    stock: Optional[int] = None
    lead_time_days: Optional[int] = None
    keywords: Optional[List[str]] = None
    is_active: Optional[bool] = None


class ProductResponse(BaseModel):
    id: UUID
    seller_id: UUID
    category_id: Optional[int]
    title_fr: str
    title_ar: Optional[str]
    description_fr: Optional[str]
    description_ar: Optional[str]
    price: Decimal
    stock: int
    lead_time_days: Optional[int]
    is_active: bool
    is_moderated: bool
    status: str
    authenticity_score: Optional[int] = None
    authenticity_badge: Optional[str] = None
    keywords: Optional[List[str]] = None
    views_count: int
    images: List[ProductImageResponse] = Field(default_factory=list)
    created_at: datetime

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    page_size: int
