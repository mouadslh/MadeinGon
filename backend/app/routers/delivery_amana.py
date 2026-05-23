from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.delivery.amana import AmanaService

router = APIRouter(prefix="/delivery/amana", tags=["delivery-amana"])


@router.post("/webhook")
async def amana_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    body = await request.body()
    signature = request.headers.get("X-Amana-Signature") or request.headers.get("x-amana-signature")
    amana = AmanaService()
    if not amana.verify_webhook_signature(body, signature):
        raise HTTPException(status_code=401, detail="Invalid signature")
    payload = await request.json()
    await amana.handle_webhook(db, payload)
    return {"ok": True}
