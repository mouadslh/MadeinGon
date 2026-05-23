# Services IA — Made in GON

Chaque capacité IA vit dans **son propre dossier** avec un
`*_service.py` et (optionnellement) un `README.md`.

```
ai/
├── whisper/          POST /ai/voice/product-fill   — voix → fiche produit
├── photo_enhancer/   POST /ai/photo/enhance        — rembg + Pillow
├── yolo/             POST /ai/photo/detect         — détection objets (legacy)
├── recommender/      GET  /ai/recommendations      — contenu + collaboratif
├── chatbot/          POST /ai/chat                 — assistant FR/AR
└── authenticity/     POST /ai/authenticity/check   — score + badge GOUN
```

## Import unique

```python
from app.services.ai import transcribe_and_fill, get_recommendations
```

(re-exports dans `app/services/ai/__init__.py`)

## Router HTTP

Les endpoints sont déclarés dans
[`app/routers/ai.py`](../../routers/ai.py) — couche mince qui
délègue aux services.

## Variables d'environnement

| Variable | Service | Effet si absente |
|----------|---------|------------------|
| `OPENAI_API_KEY` | whisper, chatbot | mock / fallback |
| `S3_*` / `CLOUDINARY_*` | photo_enhancer | upload désactivé (URL renvoyée brute) |

## Compatibilité front

| Endpoint | Composant Next.js |
|----------|-------------------|
| `POST /ai/voice/product-fill` | `components/ai/VoiceFill.tsx` |
| `POST /ai/photo/enhance`      | `components/ai/PhotoEnhancer.tsx` |
| `GET /ai/recommendations`     | `components/buyer/RecommendationCarousel.tsx` |
| `POST /ai/chat`               | `components/ai/ChatWidget.tsx` |
| `POST /ai/authenticity/check` | `components/seller/AuthenticityScanner.tsx` |

## Statut

| Service | Statut |
|---------|--------|
| chatbot       | ✅ FAQ + LLM si `OPENAI_API_KEY` |
| recommender   | ✅ règles + co-occurrence |
| photo_enhancer| ⚠️ Partiel (rembg lourd, fallback Pillow) |
| whisper       | ⚠️ Nécessite `OPENAI_API_KEY` |
| authenticity  | ⚠️ EXIF OK, recherche inverse mockée |
| yolo          | ❌ Legacy (placeholder) |
