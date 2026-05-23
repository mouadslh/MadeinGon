from datetime import datetime, timezone
from typing import Optional, Tuple
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.schemas.auth import RegisterRequest, TokenResponse, UserResponse


async def register_user(db: AsyncSession, data: RegisterRequest) -> Tuple[User, TokenResponse]:
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise ValueError("Email already registered")
    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        full_name=data.full_name,
        role="USER",
        language=data.language,
    )
    db.add(user)
    await db.flush()
    tokens = _tokens_for_user(user)
    return user, tokens


async def login_user(db: AsyncSession, email: str, password: str) -> Tuple[User, TokenResponse]:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.password_hash or ""):
        raise ValueError("Invalid credentials")
    if not user.is_active:
        raise ValueError("Account disabled")
    return user, _tokens_for_user(user)


async def get_user_by_id(db: AsyncSession, user_id: UUID) -> Optional[User]:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def upsert_google_user(
    db: AsyncSession, google_id: str, email: str, full_name: str, avatar_url: Optional[str]
) -> Tuple[User, TokenResponse]:
    result = await db.execute(select(User).where(User.google_id == google_id))
    user = result.scalar_one_or_none()
    if not user and email:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
    if user:
        user.google_id = google_id
        if avatar_url:
            user.avatar_url = avatar_url
    else:
        user = User(
            email=email,
            google_id=google_id,
            full_name=full_name,
            avatar_url=avatar_url,
            password_hash=hash_password(__import__("secrets").token_urlsafe(16)),
            role="USER",
        )
        db.add(user)
    await db.flush()
    return user, _tokens_for_user(user)


async def upsert_phone_user(
    db: AsyncSession, phone: str, full_name: Optional[str] = None
) -> Tuple[User, TokenResponse]:
    result = await db.execute(select(User).where(User.phone == phone))
    user = result.scalar_one_or_none()
    if not user:
        user = User(
            phone=phone,
            full_name=full_name or phone,
            role="USER",
        )
        db.add(user)
        await db.flush()
    return user, _tokens_for_user(user)


def _tokens_for_user(user: User) -> TokenResponse:
    return TokenResponse(
        access_token=create_access_token(user.id, user.role),
        refresh_token=create_refresh_token(user.id, user.role),
    )


def user_to_response(user: User) -> UserResponse:
    return UserResponse.model_validate(user)
