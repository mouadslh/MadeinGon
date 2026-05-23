from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.core.deps import CurrentUser
from app.models.order import Order
from app.services.payment.cmi import CMIService

router = APIRouter(prefix="/payment/cmi", tags=["payment-cmi"])
settings = get_settings()


class InitiatePaymentBody(BaseModel):
    order_id: UUID


@router.post("/initiate")
async def initiate_payment(body: InitiatePaymentBody, user: CurrentUser, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order).where(Order.id == body.order_id, Order.buyer_id == user.id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.payment_method not in ("CARD", "cmi"):
        raise HTTPException(status_code=400, detail="Order is not a card payment")
    cmi = CMIService()
    return cmi.create_payment_request(order)


@router.post("/callback")
async def cmi_callback(request: Request, db: AsyncSession = Depends(get_db)):
    form = await request.form()
    payload = dict(form)
    cmi = CMIService()
    try:
        await cmi.process_webhook(db, payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return "OK"


@router.get("/success")
async def cmi_success():
    return RedirectResponse(url=settings.CMI_OK_URL)


@router.get("/fail")
async def cmi_fail():
    return RedirectResponse(url=settings.CMI_FAIL_URL)
