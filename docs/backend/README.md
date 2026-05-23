# Backend — FastAPI

> API REST asynchrone construite avec **FastAPI**, **SQLAlchemy 2**
> (driver `asyncpg`), **Alembic** pour les migrations et **Redis**
> pour le cache / blacklist JWT / rate-limit OTP.

## Arborescence

```
backend/
├── alembic/                 # migrations
│   ├── env.py
│   └── versions/
├── app/
│   ├── main.py              # FastAPI() + include_router(...)
│   ├── core/
│   │   ├── config.py        # Settings (pydantic-settings)
│   │   ├── database.py      # async engine + sessionmaker
│   │   ├── deps.py          # gardes : CurrentUser, AdminUser, …
│   │   ├── security.py      # JWT + bcrypt
│   │   └── redis_client.py  # connexion Redis
│   ├── models/              # SQLAlchemy ORM (15 modèles)
│   ├── schemas/             # Pydantic v2 (DTOs)
│   ├── services/            # logique métier + IA
│   └── routers/             # endpoints HTTP (couche mince)
├── scripts/
│   ├── docker-entrypoint.sh # migrations + seed au boot
│   └── seed_demo.py         # comptes + catégories + produits démo
├── requirements.txt
└── Dockerfile
```

## Lancer en local (sans Docker)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 1) DB + Redis
docker compose -f ../docker-compose.deps.yml up -d

# 2) Schéma + données démo
alembic upgrade head
python scripts/seed_demo.py

# 3) API
uvicorn app.main:app --reload
```

Swagger : http://localhost:8000/docs

## Endpoints principaux

| Préfixe | Fichier router | Description |
|---------|----------------|-------------|
| `/auth` | `auth.py` | Register, login, refresh, logout, OTP, Google OAuth |
| `/users` | `users.py` | `GET /users/me` |
| `/sellers` | `sellers.py` | Application vendeur, profil public |
| `/products` | `products.py` | Catalogue public + CRUD vendeur |
| `/orders` | `orders.py` | Commandes acheteur |
| `/buyer/addresses` | `buyer_addresses.py` | Carnet d'adresses |
| `/categories` | `categories.py` | Liste des catégories |
| `/search` | `search.py` | Recherche full-text |
| `/favorites` | `favorites.py` | Wishlist / favoris |
| `/admin` | `admin.py` | Modération, KYC |
| `/ai` | `ai.py` | Voice, photo, reco, chatbot, authenticity |
| `/seller/orders` | `seller_orders.py` | Commandes côté vendeur |
| `/seller/wallet` | `seller_wallet.py` | Solde + payouts |
| `/seller/notifications` | `seller_notifications.py` | Inbox vendeur |
| `/seller/profile` | `seller_profile.py` | Boutique vendeur |
| `/seller/chatbot` | `seller_chatbot.py` | Assistant FR/AR |
| `/payment/cmi` | `payment_cmi.py` | Paiement carte (sandbox) |
| `/delivery/amana` | `delivery_amana.py` | Étiquettes Amana |

## Authentification

- JWT **HS256**, payload `{sub, role, type, exp}`
- Access token : 60 min (`JWT_ACCESS_EXPIRE_MINUTES`)
- Refresh token : 7 jours, révocable via Redis blacklist
- Bearer token dans header `Authorization`

Gardes dans `app/core/deps.py` :

```python
CurrentUser   = Annotated[User, Depends(get_current_user)]
OptionalUser  = Annotated[User | None, Depends(get_optional_user)]
AdminUser     = Annotated[User, Depends(require_roles("ADMIN"))]
SellerUser    = Annotated[User, Depends(require_roles("ADMIN", "SELLER"))]
BuyerUser     = Annotated[User, Depends(require_roles("USER","SELLER","ADMIN"))]
```

## Variables d'environnement

Toutes définies dans `backend/app/core/config.py` (`Settings`).
Voir [`docs/architecture/README.md`](../architecture/README.md#variables-denvironnement-principales).

## Migrations Alembic

```bash
alembic current                              # version actuelle
alembic upgrade head                         # appliquer toutes
alembic revision --autogenerate -m "msg"     # créer nouvelle migration
alembic downgrade -1                         # revenir d'1 cran
```

⚠️ Toujours vérifier le SQL généré (`autogenerate` ne détecte pas tout).

## Tests rapides

```bash
# Health
curl http://localhost:8000/health

# Login + token
TOKEN=$(curl -s -X POST http://localhost:8000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@madeingoun.ma","password":"admin12345"}' | jq -r .access_token)

# Me
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/auth/me

# Produits
curl "http://localhost:8000/products?page=1&page_size=4"
```

## Documentation services IA

[`backend/app/services/ai/README.md`](../../backend/app/services/ai/README.md)
