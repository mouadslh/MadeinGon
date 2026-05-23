# Whisper — Assistant vocal vendeur

## Rôle

Transforme un enregistrement audio (darija / arabe / français) en champs structurés pour le formulaire de création produit.

## Fichier

| Fichier | Responsabilité |
|---------|----------------|
| `whisper_service.py` | Transcription OpenAI Whisper + parsing JSON via GPT-4o-mini |

## Endpoint

`POST /ai/voice/product-fill` — réservé **SELLER**

## Dépendances

- `OPENAI_API_KEY` dans `.env`
- Sans clé : mode démo avec champs par défaut

## Flux

```
Audio (WebM) → Whisper → transcript → LLM + prompt RAG → JSON (title_fr, price, category_id, …)
```
