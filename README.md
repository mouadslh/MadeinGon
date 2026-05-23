# Made in GON — MVP

Marketplace full-stack pour l'artisanat de **Guelmim-Oued Noun** (Maroc).

## Démarrer toute la plateforme (Docker)

```bash
cp .env.example .env    # optionnel
docker compose up --build
```

Ou : `make up`

| Service  | URL |
|----------|-----|
| **App**  | http://localhost:3000/fr |
| **API**  | http://localhost:8000/docs |

Au premier lancement : migrations Alembic + données démo automatiques.

### Comptes démo

| Rôle    | Email                   | Mot de passe  |
|---------|-------------------------|---------------|
| Admin   | admin@madeingoun.ma     | admin12345    |
| Vendeur | artisan@madeingoun.ma   | seller12345   |

## Documentation

| Document | Contenu |
|----------|---------|
| [docs/architecture/](docs/architecture/README.md) | Vue d'ensemble, Docker |
| [docs/roles/USER/](docs/roles/USER/README.md) | Acheteur |
| [docs/roles/SELLER/](docs/roles/SELLER/README.md) | Artisan / vendeur |
| [docs/roles/ADMIN/](docs/roles/ADMIN/README.md) | Administration |
| [docs/backend/](docs/backend/README.md) | API FastAPI |
| [docs/frontend/](docs/frontend/README.md) | Next.js |
| [backend/app/services/ai/](backend/app/services/ai/README.md) | Services IA |

## Structure projet

```
MadeInGounMVP/
├── docs/                 # Architecture + rôles (README par dossier)
├── frontend/             # Next.js 14
├── backend/              # FastAPI
├── docker-compose.yml    # Postgres + Redis + API + UI
└── Makefile
```

## Stack

Next.js 14 · FastAPI · PostgreSQL 16 · Redis 7 · Alembic · Whisper / GPT (IA)

## Commandes utiles

```bash
make up-d      # Docker en arrière-plan
make down      # Arrêter
make logs      # Voir les logs
make deps      # Postgres + Redis seulement (dev local)
```

## Dépannage Docker

### `exited (137)` / `dependency failed` / `EIO: i/o error`

Cause fréquente : **disque Mac presque plein** (< 5 Go libres). Docker ne peut plus écrire ses fichiers → Redis/Postgres tués (code 137) ou fichiers illisibles.

1. Libérer de l’espace (corbeille, gros fichiers, `~/Library/Caches`, anciens projets).
2. **Redémarrer Docker Desktop** (Restart).
3. Nettoyer Docker (quand le disque a de la marge) :
   ```bash
   docker compose down
   docker system prune -a --volumes
   ```
4. Relancer : `docker compose up --build`

### Dev sans Docker Desktop (recommandé si Docker plante ou disque plein)

1. **Relancer Docker Desktop** (icône baleine → *Restart*), ou ignorer Docker pour l’UI.
2. Dans un terminal :

```bash
# Terminal A — base de données légère (Docker minimal)
make deps

# Terminal B — API
make dev-backend

# Terminal C — interface web (sans conteneur frontend)
cd frontend && cp -n .env.local.example .env.local 2>/dev/null; npm run dev
```

3. Ouvrir http://localhost:3000/fr

`backend/.env` : `DATABASE_URL=postgresql+asyncpg://madeingoun:madeingoun@localhost:5432/madeingoun`  
`frontend/.env.local` : `NEXT_PUBLIC_API_URL=http://localhost:8000`

### Photos produits qui ne s’affichent pas

- **Photos produits + CIN** : upload via l’API FastAPI → **Cloudinary** (`madeingoun/products`, `madeingoun/cin`). Clés dans `backend/.env` et `.env` (cloud `dmaj6dasi`). Le catalogue affiche les URLs `https://res.cloudinary.com/...` renvoyées par l’API.
- Sans Cloudinary, le catalogue affiche quand même les produits démo (images Unsplash) si l’API ne renvoie pas d’URL.
- Vérifier que l’API tourne : http://localhost:8000/health
