# Routers HTTP

Couche mince : validation Pydantic → appel service → réponse.

| Fichier | Préfixe | Documentation rôle |
|---------|--------|-------------------|
| `auth.py` | `/auth` | Tous |
| `users.py` | `/users` | Authentifié |
| `sellers.py` | `/sellers` | [SELLER](../../../../docs/roles/SELLER/README.md) |
| `products.py` | `/products` | [USER](../../../../docs/roles/USER/README.md) + SELLER |
| `orders.py` | `/orders` | USER + SELLER |
| `admin.py` | `/admin` | [ADMIN](../../../../docs/roles/ADMIN/README.md) |
| `ai.py` | `/ai` | [services/ai/](../services/ai/README.md) |

Ne pas mettre de logique métier ici — utiliser `app/services/`.
