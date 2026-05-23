from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.product import ProductImageResponse


class FavoriteProduct(BaseModel):
    """Subset of ProductResponse adapted to the favourites list (lighter)."""

    id: UUID
    seller_id: UUID
    title_fr: str
    title_ar: Optional[str] = None
    price: float
    authenticity_badge: Optional[str] = None
    images: List[ProductImageResponse] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class FavoriteItem(BaseModel):
    product_id: UUID
    created_at: datetime
    product: FavoriteProduct

    model_config = {"from_attributes": True}


class FavoriteListResponse(BaseModel):
    items: List[FavoriteItem]
    total: int


class FavoriteToggleResponse(BaseModel):
    product_id: UUID
    is_favorited: bool
