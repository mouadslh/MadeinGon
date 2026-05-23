from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import OptionalUser, SellerUser
from app.models.product import Product
from app.schemas.ai import (
    AuthenticityResponse,
    ChatRequest,
    ChatResponse,
    PhotoEnhanceResponse,
    RecommendationsResponse,
    VoiceProductFillResponse,
)
from app.services.ai import (
    chat,
    check_authenticity,
    enhance_product_photo,
    get_recommendations,
    transcribe_and_fill,
)

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/voice/product-fill", response_model=VoiceProductFillResponse)
async def voice_product_fill(
    user: SellerUser,
    audio: UploadFile = File(...),
):
    content = await audio.read()
    data = await transcribe_and_fill(content, audio.filename or "audio.webm")
    return VoiceProductFillResponse(**data)


@router.post("/photo/enhance", response_model=PhotoEnhanceResponse)
async def photo_enhance(
    user: SellerUser,
    image: UploadFile = File(...),
    background: str = Form("white"),
):
    content = await image.read()
    before_url, after_url = await enhance_product_photo(content, background)  # type: ignore
    return PhotoEnhanceResponse(before_url=before_url, after_url=after_url)


@router.get("/recommendations", response_model=RecommendationsResponse)
async def recommendations(
    db: AsyncSession = Depends(get_db),
    user: OptionalUser = None,
    session_id: Optional[str] = Query(None),
    limit: int = Query(8, ge=1, le=20),
):
    items = await get_recommendations(
        db, user_id=user.id if user else None, session_id=session_id, limit=limit
    )
    return RecommendationsResponse(items=items)


@router.post("/chat", response_model=ChatResponse)
async def ai_chat(data: ChatRequest, db: AsyncSession = Depends(get_db)):
    order_id = UUID(data.order_id) if data.order_id else None
    history = [{"role": m.role, "content": m.content} for m in data.conversation_history]
    result = await chat(db, data.message, data.language, order_id, history)
    return ChatResponse(**result)


@router.post("/authenticity/check", response_model=AuthenticityResponse)
async def authenticity_check(
    user: SellerUser,
    db: AsyncSession = Depends(get_db),
    image: UploadFile = File(...),
    product_id: Optional[str] = Form(None),
    category_id: int = Form(1),
):
    content = await image.read()
    score, badge, flags = await check_authenticity(content, category_id)
    if product_id:
        product = await db.get(Product, UUID(product_id))
        if product:
            from decimal import Decimal

            product.authenticity_score = Decimal(str(score))
            product.authenticity_badge = badge
            if score < 50:
                product.is_moderated = False
    return AuthenticityResponse(authenticity_score=score, authenticity_badge=badge, flags=flags)
