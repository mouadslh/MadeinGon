"""Chatbot support client (GPT-4o-mini) avec contexte commande."""
from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.order import Order

settings = get_settings()

SYSTEM_FR = """Tu es l'assistant Made in GON, marketplace d'artisanat de Guelmim-Oued Noun.
Réponds en français sur: livraison (Amana, CTM, Ghazal), paiement (COD, carte CMI), retours, statut commande.
Sois chaleureux et concis. Si plainte complexe, suggère contact humain."""

SYSTEM_AR = """أنت مساعد Made in GON لسوق الحرف اليدوية في إقليم كلميم واد نون.
أجب بالعربية عن التوصيل والدفع والمرتجعات وحالة الطلب."""


async def chat(
    db: AsyncSession,
    message: str,
    language: str = "fr",
    order_id: UUID | None = None,
    history: list[dict[str, str]] | None = None,
) -> dict[str, Any]:
    context = ""
    handoff = False

    if order_id:
        order = (await db.execute(select(Order).where(Order.id == order_id))).scalar_one_or_none()
        if order:
            context = (
                f"Commande {order.id}: statut={order.status}, "
                f"paiement={order.payment_status}, total={order.total} MAD."
            )

    system = SYSTEM_AR if language == "ar" else SYSTEM_FR

    if settings.OPENAI_API_KEY:
        try:
            from openai import AsyncOpenAI

            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            messages: list[dict[str, str]] = [{"role": "system", "content": system + "\n" + context}]
            for h in history or []:
                messages.append({"role": h["role"], "content": h["content"]})
            messages.append({"role": "user", "content": message})
            resp = await client.chat.completions.create(
                model="gpt-4o-mini", messages=messages, max_tokens=400
            )
            reply = resp.choices[0].message.content or ""
            if any(w in message.lower() for w in ["avocat", "tribunal", "arnaque", "police", "محامي"]):
                handoff = True
                reply += "\n\nUn conseiller humain vous contactera sous 24h."
            return {"reply": reply, "handoff": handoff}
        except Exception:
            pass

    if language == "ar":
        reply = "مرحباً! كيف يمكنني مساعدتك في طلبك أو التوصيل؟"
    else:
        reply = (
            "Bonjour! Je peux vous aider avec la livraison, le paiement à la livraison (COD), "
            "ou le suivi de commande. Posez votre question!"
        )
        if context:
            reply = f"{reply}\n\n{context}"
    return {"reply": reply, "handoff": handoff}
