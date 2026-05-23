from typing import Optional

import redis.asyncio as redis

from app.core.config import get_settings

_settings = get_settings()
_client: Optional[redis.Redis] = None


async def get_redis() -> redis.Redis:
    global _client
    if _client is None:
        _client = redis.from_url(_settings.REDIS_URL, decode_responses=True)
    return _client


async def blacklist_refresh_token(token: str, ttl_seconds: int) -> None:
    r = await get_redis()
    await r.setex(f"refresh_blacklist:{token}", ttl_seconds, "1")


async def is_refresh_blacklisted(token: str) -> bool:
    r = await get_redis()
    return await r.exists(f"refresh_blacklist:{token}") > 0


async def check_otp_rate_limit(phone: str) -> bool:
    """Returns True if rate limit exceeded."""
    r = await get_redis()
    key = f"otp_rate:{phone}"
    count = await r.incr(key)
    if count == 1:
        await r.expire(key, _settings.OTP_RATE_LIMIT_WINDOW_SECONDS)
    return count > _settings.OTP_RATE_LIMIT_MAX
