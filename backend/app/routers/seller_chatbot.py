from fastapi import APIRouter

router = APIRouter(prefix="/seller/chatbot", tags=["seller-chatbot"])


@router.post("/message")
async def seller_chatbot_message(payload: dict):
    """Placeholder seller assistant — wire OpenAI when configured."""
    return {"reply": "Assistant vendeur (démo). Configurez OPENAI_API_KEY pour des réponses IA."}
