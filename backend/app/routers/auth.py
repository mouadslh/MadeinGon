from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.core.deps import CurrentUser
from app.core.redis_client import blacklist_refresh_token, is_refresh_blacklisted
from app.core.security import create_access_token, decode_token
from app.schemas.auth import (
    LoginRequest,
    OtpSendRequest,
    OtpVerifyRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.services import auth_service
from app.services.otp_service import send_otp, verify_otp

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


@router.post("/register", response_model=TokenResponse)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    try:
        _, tokens = await auth_service.register_user(db, data)
        return tokens
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        _, tokens = await auth_service.login_user(db, data.email, data.password)
        return tokens
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshRequest):
    if await is_refresh_blacklisted(data.refresh_token):
        raise HTTPException(status_code=401, detail="Token revoked")
    payload = decode_token(data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    from uuid import UUID

    user_id = UUID(payload["sub"])
    role = payload["role"]
    return TokenResponse(
        access_token=create_access_token(user_id, role),
        refresh_token=data.refresh_token,
    )


@router.post("/logout")
async def logout(data: RefreshRequest, user: CurrentUser):
    ttl = settings.JWT_REFRESH_EXPIRE_DAYS * 86400
    await blacklist_refresh_token(data.refresh_token, ttl)
    return {"message": "Logged out"}


@router.get("/me", response_model=UserResponse)
async def me(user: CurrentUser):
    return auth_service.user_to_response(user)


@router.post("/otp/send")
async def otp_send(data: OtpSendRequest, db: AsyncSession = Depends(get_db)):
    try:
        code = await send_otp(db, data.phone)
        resp = {"message": "OTP sent"}
        if not settings.TWILIO_ACCOUNT_SID:
            resp["dev_code"] = code
        return resp
    except ValueError as e:
        raise HTTPException(status_code=429, detail=str(e))


@router.post("/otp/verify", response_model=TokenResponse)
async def otp_verify(data: OtpVerifyRequest, db: AsyncSession = Depends(get_db)):
    if not await verify_otp(db, data.phone, data.code):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    _, tokens = await auth_service.upsert_phone_user(db, data.phone, data.full_name)
    return tokens


@router.get("/google")
async def google_login(request: Request):
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=501, detail="Google OAuth not configured")
    from authlib.integrations.starlette_client import OAuth

    oauth = OAuth()
    oauth.register(
        name="google",
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )
    redirect_uri = settings.GOOGLE_REDIRECT_URI
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback")
async def google_callback(request: Request, db: AsyncSession = Depends(get_db)):
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=501, detail="Google OAuth not configured")
    from authlib.integrations.starlette_client import OAuth

    oauth = OAuth()
    oauth.register(
        name="google",
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )
    token = await oauth.google.authorize_access_token(request)
    userinfo = token.get("userinfo") or {}
    _, tokens = await auth_service.upsert_google_user(
        db,
        google_id=userinfo.get("sub", ""),
        email=userinfo.get("email", ""),
        full_name=userinfo.get("name", "User"),
        avatar_url=userinfo.get("picture"),
    )
    frontend = settings.cors_origins_list[0] if settings.cors_origins_list else "http://localhost:3000"
    return RedirectResponse(f"{frontend}/login?access_token={tokens.access_token}&refresh_token={tokens.refresh_token}")
