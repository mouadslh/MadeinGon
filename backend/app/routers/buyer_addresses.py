"""Buyer delivery addresses (COD checkout)."""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import BuyerUser
from app.models.address import Address
from app.schemas.address import AddressResponse, DeliveryAddressCreate

router = APIRouter(prefix="/buyer/addresses", tags=["buyer-addresses"])


@router.get("", response_model=list[AddressResponse])
async def list_addresses(user: BuyerUser, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Address).where(Address.user_id == user.id).order_by(Address.is_default.desc())
    )
    return [AddressResponse.model_validate(a) for a in result.scalars().all()]


@router.post("", response_model=AddressResponse, status_code=201)
async def create_address(
    data: DeliveryAddressCreate, user: BuyerUser, db: AsyncSession = Depends(get_db)
):
    if data.is_default:
        existing = await db.execute(select(Address).where(Address.user_id == user.id))
        for addr in existing.scalars().all():
            addr.is_default = False

    addr = Address(
        user_id=user.id,
        full_name=data.full_name.strip(),
        phone=data.phone,
        street=data.street.strip(),
        city=data.city.strip(),
        postal_code=data.postal_code,
        label=data.label.strip() if data.label else None,
        is_default=data.is_default,
    )
    db.add(addr)
    await db.flush()
    return AddressResponse.model_validate(addr)
