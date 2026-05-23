"""Transcription audio (Whisper) + extraction champs produit (LLM)."""
import json
from typing import Any

from app.core.config import get_settings

settings = get_settings()

SYSTEM_PROMPT = """You extract product listing fields from artisan voice transcripts for Made in GON marketplace.
Return JSON only with keys: title_fr, title_ar, description_fr, description_ar, price (number), category_id (int 1-5), keywords (array).
Categories: 1=artisanat, 2=alimentaire, 3=cosmetique, 4=textile, 5=bijoux."""


async def transcribe_and_fill(audio_bytes: bytes, filename: str = "audio.webm") -> dict[str, Any]:
    transcript = ""
    if settings.OPENAI_API_KEY:
        try:
            import io

            from openai import AsyncOpenAI

            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            audio_file = io.BytesIO(audio_bytes)
            audio_file.name = filename
            tr = await client.audio.transcriptions.create(model="whisper-1", file=audio_file)
            transcript = tr.text or ""
            if transcript:
                chat = await client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": transcript},
                    ],
                    response_format={"type": "json_object"},
                )
                data = json.loads(chat.choices[0].message.content or "{}")
                data["transcript"] = transcript
                return data
        except Exception:
            pass
    return {
        "title_fr": "Produit artisanal",
        "title_ar": "منتج حرفي",
        "description_fr": transcript or "Description à compléter.",
        "description_ar": "",
        "price": 0,
        "category_id": 1,
        "keywords": ["artisanat", "goun"],
        "transcript": transcript or "[Mode démo — configurez OPENAI_API_KEY]",
    }
