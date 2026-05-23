from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import SellerUser
from app.core.security import hash_password, verify_password
from app.models.seller import SellerProfile
from app.models.user import User

router = APIRouter(prefix="/seller", tags=["seller-profile"])


class SellerProfileUpdateBody(BaseModel):
    shop_name: str | None = Field(default=None, min_length=2, max_length=150)
    bio: str | None = Field(default=None, max_length=500)
    location: str | None = None
    phone: str | None = None
    banner_url: str | None = None
    avatar_url: str | None = None


class SellerAccountUpdateBody(BaseModel):
    language: str | None = None
    current_password: str | None = None
    new_password: str | None = Field(default=None, min_length=8)


async def _get_profile(db: AsyncSession, user_id) -> SellerProfile | None:
    result = await db.execute(select(SellerProfile).where(SellerProfile.user_id == user_id))
    return result.scalar_one_or_none()


@router.patch("/profile")
async def update_seller_profile(
    data: SellerProfileUpdateBody, user: SellerUser, db: AsyncSession = Depends(get_db)
):
    profile = await _get_profile(db, user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Seller profile not found")
    if data.shop_name is not None:
        profile.shop_name = data.shop_name
    if data.location is not None:
        profile.city = data.location
    if data.bio is not None:
        profile.bio_fr = data.bio
    if data.avatar_url is not None:
        profile.avatar_url = data.avatar_url
    if data.phone is not None:
        db_user = await db.get(User, user.id)
        if db_user:
            db_user.phone = data.phone
    await db.commit()
    return {"message": "Seller profile updated"}


@router.patch("/account")
async def update_seller_account(
    data: SellerAccountUpdateBody, user: SellerUser, db: AsyncSession = Depends(get_db)
):
    model = await db.get(User, user.id)
    if not model:
        raise HTTPException(status_code=404, detail="User not found")
    if data.language is not None:
        model.language = data.language
    if data.current_password and data.new_password:
        if not model.password_hash or not verify_password(data.current_password, model.password_hash):
            raise HTTPException(status_code=400, detail="Invalid current password")
        if data.current_password == data.new_password:
            raise HTTPException(status_code=400, detail="New password must differ from current")
        model.password_hash = hash_password(data.new_password)
    await db.commit()
    return {"message": "Seller account updated"}
