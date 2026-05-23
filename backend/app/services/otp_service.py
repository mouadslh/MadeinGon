from datetime import datetime, timedelta, timezone

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.redis_client import check_otp_rate_limit
from app.core.security import generate_otp_code
from app.models.otp import OtpToken

settings = get_settings()


async def send_otp(db: AsyncSession, phone: str) -> str:
    if await check_otp_rate_limit(phone):
        raise ValueError("Too many OTP requests. Try again later.")
    code = generate_otp_code()
    expires = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
    token = OtpToken(phone=phone, code=code, expires_at=expires)
    db.add(token)
    await db.flush()
    # Twilio integration — log in dev when not configured
    if settings.TWILIO_ACCOUNT_SID:
        try:
            from twilio.rest import Client

            client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
            client.messages.create(
                body=f"Votre code Made in GON: {code}",
                from_=settings.TWILIO_PHONE_NUMBER,
                to=phone,
            )
        except Exception:
            pass
    return code  # In production, don't return code; dev only


async def verify_otp(db: AsyncSession, phone: str, code: str) -> bool:
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(OtpToken)
        .where(OtpToken.phone == phone, OtpToken.code == code, OtpToken.used == False)
        .order_by(OtpToken.created_at.desc())
        .limit(1)
    )
    token = result.scalar_one_or_none()
    if not token or token.expires_at < now:
        return False
    await db.execute(update(OtpToken).where(OtpToken.id == token.id).values(used=True))
    return True
