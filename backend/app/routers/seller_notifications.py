import asyncio
import json
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import SellerUser
from app.core.security import decode_token
from app.core.redis_client import get_redis
from app.models.notification import Notification

router = APIRouter(prefix="/seller/notifications", tags=["seller-notifications"])


@router.get("")
async def list_notifications(
    user: SellerUser,
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    unread_only: bool = Query(False),
    type: str | None = Query(None),
):
    q = select(Notification).where(Notification.seller_id == user.id)
    if unread_only:
        q = q.where(Notification.is_read.is_(False))
    if type:
        q = q.where(Notification.type == type)
    total = await db.scalar(select(func.count()).select_from(q.subquery())) or 0
    result = await db.execute(
        q.order_by(Notification.created_at.desc()).offset((page - 1) * limit).limit(limit)
    )
    items = [
        {
            "id": str(n.id),
            "type": n.type,
            "title": n.title,
            "body": n.body,
            "data": n.data,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat(),
        }
        for n in result.scalars().all()
    ]
    unread = await db.scalar(
        select(func.count()).where(Notification.seller_id == user.id, Notification.is_read.is_(False))
    )
    return {"total": total, "page": page, "unread_count": unread or 0, "notifications": items}


@router.get("/unread-count")
async def unread_count(user: SellerUser, db: AsyncSession = Depends(get_db)):
    count = await db.scalar(
        select(func.count()).where(Notification.seller_id == user.id, Notification.is_read.is_(False))
    )
    return {"count": count or 0}


@router.patch("/{notif_id}/read")
async def mark_read(notif_id: UUID, user: SellerUser, db: AsyncSession = Depends(get_db)):
    notif = await db.get(Notification, notif_id)
    if not notif or notif.seller_id != user.id:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    await db.flush()
    return {"ok": True}


@router.patch("/read-all")
async def mark_all_read(user: SellerUser, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Notification).where(Notification.seller_id == user.id, Notification.is_read.is_(False))
    )
    for n in result.scalars().all():
        n.is_read = True
    await db.flush()
    return {"ok": True}


@router.delete("/{notif_id}")
async def delete_notification(notif_id: UUID, user: SellerUser, db: AsyncSession = Depends(get_db)):
    notif = await db.get(Notification, notif_id)
    if not notif or notif.seller_id != user.id:
        raise HTTPException(status_code=404, detail="Notification not found")
    await db.delete(notif)
    await db.flush()
    return {"ok": True}


@router.get("/stream")
async def notification_stream(request: Request, token: str | None = Query(None)):
    auth = request.headers.get("Authorization", "")
    raw_token = token
    if auth.startswith("Bearer "):
        raw_token = auth[7:]
    if not raw_token:
        raise HTTPException(status_code=401, detail="Token required")

    payload = decode_token(raw_token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token")
    seller_id = payload.get("sub")

    async def event_generator():
        r = await get_redis()
        pubsub = r.pubsub()
        channel = f"notif:{seller_id}"
        await pubsub.subscribe(channel)
        try:
            yield f"data: {json.dumps({'type': 'connected'})}\n\n"
            ping = 0
            while True:
                if await request.is_disconnected():
                    break
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message and message.get("type") == "message":
                    yield f"data: {message['data']}\n\n"
                ping += 1
                if ping >= 30:
                    yield f"data: {json.dumps({'type': 'ping'})}\n\n"
                    ping = 0
                await asyncio.sleep(1)
        finally:
            await pubsub.unsubscribe(channel)
            await pubsub.close()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"},
    )
