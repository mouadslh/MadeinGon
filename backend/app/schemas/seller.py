from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class SellerApplyRequest(BaseModel):
    shop_name: str = Field(..., min_length=2, max_length=200)
    city: str = Field(..., min_length=2, max_length=100)
    craft_type: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = None
    cin_image_url: Optional[str] = None


class SellerApplicationResponse(BaseModel):
    id: UUID
    user_id: UUID
    status: str
    admin_note: Optional[str] = None
    submitted_at: datetime

    model_config = {"from_attributes": True}


class SellerProfileResponse(BaseModel):
    id: UUID
    user_id: UUID
    shop_name: str
    city: str
    region: str
    avatar_url: Optional[str] = None
    bio_fr: Optional[str] = None
    bio_ar: Optional[str] = None
    cin_url: Optional[str] = None
    cin_verified: bool = False
    phone_verified: bool = False
    authenticity_score: Optional[int] = None
    rating: Decimal
    total_sales: int
    is_verified: bool

    model_config = {"from_attributes": True}


class SellerProfileUpdate(BaseModel):
    shop_name: Optional[str] = None
    city: Optional[str] = None
    avatar_url: Optional[str] = None
    bio_fr: Optional[str] = None
    bio_ar: Optional[str] = None
    bank_rib: Optional[str] = None


class SellerPublicResponse(BaseModel):
    id: UUID
    shop_name: str
    city: str
    region: str
    avatar_url: Optional[str] = None
    bio_fr: Optional[str] = None
    bio_ar: Optional[str] = None
    rating: Decimal
    total_sales: int
    is_verified: bool

    model_config = {"from_attributes": True}


class AdminCreateSellerRequest(BaseModel):
    full_name: str
    phone: str
    city: str
    shop_name: str
    craft_type: Optional[str] = None


class RejectApplicationRequest(BaseModel):
    admin_note: str
