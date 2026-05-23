# Docker — Made in GON

Tous les services tournent via **docker-compose**.

## Topologie

```
docker-compose.yml
├── db        (postgres:16)        port 5432
├── redis     (redis:7-alpine)     port 6379
├── api       (FastAPI)            port 8000  ← migrations + seed au boot
└── web       (Next.js prod build) port 3000
```

## Démarrer

```bash
docker compose up --build         # premier lancement
docker compose up -d              # arrière-plan
docker compose down               # arrêter
docker compose logs -f api        # voir les logs
```

Raccourcis Makefile :

```bash
make up        # build + up
make up-d      # build + up -d
make down      # down
make logs      # logs api
make deps      # uniquement postgres + redis (docker-compose.deps.yml)
make dev-back  # uvicorn local (sans Docker)
```

## Variables d'environnement

Le fichier racine `.env` (copié depuis `.env.example`) alimente tous les
conteneurs. Les blocs importants :

```ini
# Base
DATABASE_URL=postgresql+asyncpg://madeingoun:madeingoun@db:5432/madeingoun
REDIS_URL=redis://redis:6379/0
JWT_SECRET=change-me-in-prod

# CORS frontend
CORS_ORIGINS=http://localhost:3000

# Cloudinary (photos produits + CIN)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Healthchecks intégrés

| Service | Endpoint |
|---------|----------|
| API     | `GET /health` → `{"status":"ok"}` |
| Web     | `GET /` redirige vers `/fr` |
| Postgres| `pg_isready -U madeingoun` |
| Redis   | `redis-cli ping` |

## Dépannage rapide

| Symptôme | Cause probable | Action |
|----------|----------------|--------|
| `exited (137)` | RAM/disque Docker saturé | Restart Docker · `docker system prune -a --volumes` |
| `dependency failed` | Postgres pas prêt | Relancer · vérifier le port 5432 libre |
| `EIO: i/o error` | Disque Mac plein | Libérer 5+ Go puis restart Docker |
| `CORS error` | `CORS_ORIGINS` ≠ URL front | Vérifier `.env` puis `docker compose restart api` |
| Migrations échouent | Schéma divergent | `docker compose down -v` puis up à neuf |

## Dev sans Docker

```bash
# Terminal A — dépendances minimales (Postgres + Redis Docker)
make deps

# Terminal B — backend Python
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Terminal C — frontend Next.js
cd frontend
cp -n .env.local.example .env.local
npm install
npm run dev
```
