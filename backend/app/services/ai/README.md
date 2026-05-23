# Services IA

Chaque capacité IA vit dans **son propre dossier** avec un `*_service.py` et un `README.md`.

```
ai/
├── whisper/          POST /ai/voice/product-fill
├── yolo/             POST /ai/photo/enhance
├── recommender/      GET  /ai/recommendations
├── chatbot/          POST /ai/chat
└── authenticity/     POST /ai/authenticity/check
```

## Import unique (recommandé)

```python
from app.services.ai import transcribe_and_fill, get_recommendations
```

## Router

Les endpoints HTTP sont définis dans `app/routers/ai.py` — couche mince qui délègue aux services.
