# Rôle ADMIN — Administration

> Le rôle `ADMIN` est attribué manuellement (script de seed ou
> `UPDATE users SET role = 'ADMIN'`). Compte démo créé au seed :
> `admin@madeingoun.ma / admin12345`.

## Responsabilités

- **Modérer les produits** (`pending` → `approved` / `rejected`)
- **Valider les demandes vendeur** (KYC : CIN + ville + métier)
- **Gérer les utilisateurs** (suspendre, changer rôle)
- **Superviser les commandes & litiges**
- **Lire les KPIs globaux**

## Endpoints ADMIN (`prefix=/admin`)

| Méthode | Chemin | Fonction |
|---------|--------|----------|
| GET | `/admin/products` | Lister tous les produits (filtre statut) |
| PATCH | `/admin/products/{id}/moderate` | Approuver / rejeter |
| GET | `/admin/seller-applications` | File d'attente KYC |
| PATCH | `/admin/seller-applications/{id}` | Approuver / rejeter |
| GET | `/admin/users` | Lister utilisateurs |
| PATCH | `/admin/users/{id}` | Suspendre, changer rôle |
| GET | `/admin/orders` | Toutes les commandes |
| GET | `/admin/disputes` | Litiges ouverts |

Voir [`backend/app/routers/admin.py`](../../../backend/app/routers/admin.py).

## Composants frontend

| Page | Fichier |
|------|---------|
| Dashboard admin | `app/[locale]/admin/dashboard/page.tsx` |
| Produits (modération) | `app/[locale]/admin/products/page.tsx` |
| Demandes vendeur | `app/[locale]/admin/seller-applications/page.tsx` |
| Utilisateurs | `app/[locale]/admin/users/page.tsx` |
| Commandes | `app/[locale]/admin/orders/page.tsx` |

## Flux modération produit

```
SELLER crée produit  ─►  status="pending", is_moderated=false
        │
        ▼
ADMIN ouvre /admin/products?status=pending
        │
        ▼
PATCH /admin/products/{id}/moderate {action:"approve|reject", note?}
        │
        ▼
status="approved" + is_moderated=true   ─►  visible dans /products (public)
```

## Tests curl

```bash
TOKEN_ADMIN="<token admin>"

curl -X GET "http://localhost:8000/admin/products?status=pending" \
  -H "Authorization: Bearer $TOKEN_ADMIN"

curl -X PATCH "http://localhost:8000/admin/products/<id>/moderate" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"action":"approve","note":"OK"}'
```

## Statut

✅ **Fonctionnel** — endpoints de modération opérationnels, UI admin
prête (Next.js) sous `/[locale]/admin/*`.
