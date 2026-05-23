import logging

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


async def send_email(to: str, subject: str, body: str) -> None:
    if not settings.RESEND_API_KEY:
        logger.info("Email (dev): to=%s subject=%s", to, subject)
        return
    try:
        import httpx

        async with httpx.AsyncClient() as client:
            await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
                json={"from": settings.EMAIL_FROM, "to": [to], "subject": subject, "html": body},
            )
    except Exception as e:
        logger.warning("Email send failed: %s", e)


async def send_sms(phone: str, message: str) -> None:
    if not settings.TWILIO_ACCOUNT_SID:
        logger.info("SMS (dev): %s — %s", phone, message)
        return
    try:
        from twilio.rest import Client

        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        client.messages.create(body=message, from_=settings.TWILIO_PHONE_NUMBER, to=phone)
    except Exception as e:
        logger.warning("SMS send failed: %s", e)


async def notify_seller_decision(email: str | None, phone: str | None, approved: bool, note: str = "") -> None:
    msg = "Félicitations! Votre demande vendeur a été approuvée." if approved else f"Votre demande a été refusée. {note}"
    if email:
        await send_email(email, "Made in GON — Demande vendeur", f"<p>{msg}</p>")
    if phone:
        await send_sms(phone, msg)
