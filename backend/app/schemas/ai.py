from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class VoiceProductFillResponse(BaseModel):
    title_fr: Optional[str] = None
    title_ar: Optional[str] = None
    description_fr: Optional[str] = None
    description_ar: Optional[str] = None
    price: Optional[float] = None
    category_id: Optional[int] = None
    keywords: List[str] = []
    transcript: str = ""


class PhotoEnhanceResponse(BaseModel):
    before_url: str
    after_url: str


class RecommendationItem(BaseModel):
    product_id: str
    reason: str


class RecommendationsResponse(BaseModel):
    items: List[Dict[str, Any]]


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    language: str = "fr"
    order_id: Optional[str] = None
    conversation_history: List[ChatMessage] = []


class ChatResponse(BaseModel):
    reply: str
    handoff: bool = False


class AuthenticityResponse(BaseModel):
    authenticity_score: float
    authenticity_badge: bool
    flags: List[str] = []
