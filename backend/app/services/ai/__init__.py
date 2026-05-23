"""
Services IA — un sous-dossier par capacité.

whisper/       → vocal → formulaire produit
yolo/          → photo produit
recommender/   → suggestions homepage
chatbot/       → support client
authenticity/  → score authenticité
"""

from app.services.ai.authenticity import check_authenticity
from app.services.ai.chatbot import chat
from app.services.ai.recommender import get_recommendations
from app.services.ai.whisper import transcribe_and_fill
from app.services.ai.yolo import enhance_product_photo

__all__ = [
    "transcribe_and_fill",
    "enhance_product_photo",
    "get_recommendations",
    "chat",
    "check_authenticity",
]
