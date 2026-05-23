# Rôle SELLER — Artisan

> Le rôle `SELLER` est attribué par un admin après validation d'une
> demande (`POST /sellers/apply`). Un vendeur reste également `USER` :
> il peut acheter et vendre depuis le même compte.

## Parcours

```
USER  ─►  /seller-apply  ─►  ADMIN approuve  ─►  rôle = SELLER
                                                       │
                                                       ▼
                                          /seller/dashboard
                                          ├── Mes produits
                                          ├── Commandes reçues
                                          ├── Wallet / payouts
                                          └── Notifications
```

## Endpoints SELLER

| Fonction | Endpoint | Auth |
|----------|----------|------|
| Demander à devenir vendeur | `POST /sellers/apply` | USER |
| Profil boutique | `GET/PATCH /sellers/profile/me` | SELLER |
| Upload CIN | `POST /sellers/cin` | USER (en cours d'application) |
| Mes produits | `GET /products/seller/mine` | SELLER |
| Créer produit | `POST /products` | SELLER (statut `active`) |
| Upload image produit | `POST /products/upload-image` | SELLER |
| Modifier / Toggle / Supprimer | `PUT/PATCH/DELETE /products/{id}` | SELLER |
| Commandes reçues | `GET /seller/orders` | SELLER |
| Marquer expédié | `POST /seller/orders/{id}/ship` | SELLER |
| Mon wallet | `GET /seller/wallet` | SELLER |
| Demander un payout | `POST /seller/wallet/payouts` | SELLER |
| Mes notifications | `GET /seller/notifications` | SELLER |
| Assistant IA vendeur | `POST /seller/chatbot/ask` | SELLER |

## Composants frontend

| Page | Fichier |
|------|---------|
| Demander à être vendeur | `app/[locale]/seller-apply/page.tsx` |
| Dashboard | `app/[locale]/seller/dashboard/page.tsx` |
| Mes produits | `app/[locale]/seller/products/page.tsx` |
| Nouveau produit | `app/[locale]/seller/products/new/page.tsx` |
| Commandes | `app/[locale]/seller/orders/page.tsx` |
| Wallet | `app/[locale]/seller/wallet/page.tsx` |

## IA pour vendeurs

- **Voice fill** : `POST /ai/voice/product-fill` (Whisper) — l'artisan
  parle en darija/hassania, l'IA pré-remplit la fiche.
- **Photo enhancer** : `POST /ai/photo/enhance` (rembg + Pillow) —
  fond pro, lumière améliorée.
- **Badge authenticité** : `POST /ai/authenticity/check` — score
  EXIF + recherche inverse, déclenche `authenticity_badge`.

## Variables d'environnement

| Variable | Effet |
|----------|-------|
| `CLOUDINARY_*` | Upload CIN + photos produits |
| `OPENAI_API_KEY` | Voice fill (Whisper) et chatbot |
| `AMANA_API_KEY` | Étiquettes de livraison Amana Express |

## Test curl rapide

```bash
TOKEN_SELLER="<token vendeur>"
curl -X GET http://localhost:8000/products/seller/mine \
  -H "Authorization: Bearer $TOKEN_SELLER"

# Compte démo : artisan@madeingoun.ma / seller12345
```

Statut global : ✅ **Fonctionnel** (création produits, gestion commandes,
wallet). IA dépend des clés API tierces.
