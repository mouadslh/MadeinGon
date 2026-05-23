# Architecture — Made in GON

> Vue d'ensemble de la plateforme **Made in GON** : marketplace d'artisanat
> de la région **Guelmim-Oued Noun** (Maroc). Stack full-stack moderne avec
> assistance IA (vocal, recommandations, modération, authenticité).

## Stack technique

| Couche | Techno | Rôle |
|--------|--------|------|
| Frontend | **Next.js 14** (App Router) | UI publique + dashboards |
| i18n | **next-intl 3.x** | Français + Arabe (RTL) |
| Backend | **FastAPI** (Python 3.11) | API REST `/api` |
| ORM | **SQLAlchemy 2 (async)** + **Alembic** | Persistance + migrations |
| DB | **PostgreSQL 16** | Données métier |
| Cache | **Redis 7** | OTP, sessions, blacklist JWT |
| Médias | **Cloudinary** | Photos produits + CIN vendeurs |
| Auth | JWT (HS256) + Google OAuth (Authlib) | Comptes USER · SELLER · ADMIN |
| IA | **Whisper · YOLO · GPT** | Voice, photo enhancer, recommander, chatbot |
| Conteneurs | **Docker Compose** | Postgres + Redis + API + Web |

## Schéma haut-niveau

```
                ┌──────────────┐
                │  Navigateur  │
                └──────┬───────┘
                       │ HTTPS
                       ▼
            ┌──────────────────────┐
            │  Next.js 14 (3000)   │  ←─ next-intl /fr · /ar (RTL)
            │  App Router + SSR    │      Tailwind · Framer Motion
            └──────┬───────────────┘
                   │ axios JSON · Bearer JWT
                   ▼
            ┌──────────────────────┐
            │  FastAPI (8000)      │  ←─ Pydantic · async SQLAlchemy
            │  /auth /products …   │      OAuth Google · OTP SMS
            └──┬───────┬────────┬──┘
               │       │        │
               ▼       ▼        ▼
        ┌─────────┐ ┌──────┐ ┌──────────┐
        │ Postgres│ │Redis │ │Cloudinary│
        │  16     │ │  7   │ │ médias   │
        └─────────┘ └──────┘ └──────────┘
```

## Lancement rapide

```bash
cp .env.example .env
docker compose up --build
```

| Service | URL |
|---------|-----|
| Web     | http://localhost:3000/fr |
| API     | http://localhost:8000/docs |
| Health  | http://localhost:8000/health |

Le conteneur API exécute automatiquement :
1. `alembic upgrade head` (création schéma)
2. `python scripts/seed_demo.py` (catégories, comptes démo, produits)

## Comptes démo

| Rôle    | Email                   | Mot de passe |
|---------|-------------------------|--------------|
| Admin   | admin@madeingoun.ma     | admin12345   |
| Vendeur | artisan@madeingoun.ma   | seller12345  |

## Documentation par rôle

| Document | Lien |
|----------|------|
| Acheteur / USER | [../roles/USER/README.md](../roles/USER/README.md) |
| Artisan / SELLER | [../roles/SELLER/README.md](../roles/SELLER/README.md) |
| Administration / ADMIN | [../roles/ADMIN/README.md](../roles/ADMIN/README.md) |
| API FastAPI | [../backend/README.md](../backend/README.md) |
| UI Next.js | [../frontend/README.md](../frontend/README.md) |
| Services IA | [../../backend/app/services/ai/README.md](../../backend/app/services/ai/README.md) |
| Docker / Compose | [DOCKER.md](./DOCKER.md) |

## Variables d'environnement principales

| Variable | Côté | Description |
|----------|------|-------------|
| `DATABASE_URL` | back | `postgresql+asyncpg://user:pass@host:5432/madeingoun` |
| `REDIS_URL` | back | `redis://localhost:6379/0` |
| `JWT_SECRET` | back | Secret de signature JWT (>= 32 caractères) |
| `CORS_ORIGINS` | back | `http://localhost:3000` (CSV) |
| `GOOGLE_CLIENT_ID` / `_SECRET` | back | OAuth Google (optionnel) |
| `CLOUDINARY_URL` | back | Upload photos produits + CIN |
| `NEXT_PUBLIC_API_URL` | front | URL de l'API FastAPI |

## Internationalisation

La plateforme supporte **uniquement 2 langues** :

- 🇫🇷 **Français** (`fr`) — locale par défaut, `dir="ltr"`
- 🇲🇦 **العربية** (`ar`) — `dir="rtl"`

Toutes les URLs sont préfixées (`/fr/…` ou `/ar/…`).
Voir [`frontend/lib/i18n.ts`](../../frontend/lib/i18n.ts) et
[`frontend/middleware.ts`](../../frontend/middleware.ts).

## Tests de bonne santé

```bash
# API up ?
curl http://localhost:8000/health

# Catalogue accessible (sans auth) ?
curl "http://localhost:8000/products?page=1&page_size=4"

# Login démo
curl -X POST http://localhost:8000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@madeingoun.ma","password":"admin12345"}'
```
