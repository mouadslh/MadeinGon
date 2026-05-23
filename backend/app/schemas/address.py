from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator
import re

PHONE_PATTERN = re.compile(r"^(\+212|00212|0)[5-7]\d{8}$")


class DeliveryAddressCreate(BaseModel):
    """Maps to `addresses` table columns used for COD delivery."""

    full_name: str = Field(..., min_length=1, max_length=150)
    phone: str = Field(..., min_length=8, max_length=20)
    street: str = Field(..., min_length=1)
    city: str = Field(..., min_length=1, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    label: Optional[str] = Field(None, max_length=50)
    is_default: bool = False

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        cleaned = re.sub(r"[\s\-().]", "", v)
        if not PHONE_PATTERN.match(cleaned):
            raise ValueError("Numéro invalide (format Maroc : +2126XXXXXXXX ou 06XXXXXXXX)")
        return cleaned

    @field_validator("postal_code")
    @classmethod
    def validate_postal(cls, v: Optional[str]) -> Optional[str]:
        if v is None or v.strip() == "":
            return None
        if len(v) > 20:
            raise ValueError("Code postal trop long (max 20 caractères)")
        return v.strip()


class AddressResponse(BaseModel):
    id: UUID
    full_name: str
    phone: str
    street: str
    city: str
    postal_code: Optional[str]
    label: Optional[str]
    is_default: bool

    model_config = {"from_attributes": True}
