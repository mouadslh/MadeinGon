# Rôle USER — Acheteur

> Le rôle `USER` est attribué automatiquement à toute personne qui
> s'inscrit ou se connecte via Google / OTP SMS / email. C'est le rôle
> par défaut de la plateforme.

## Parcours typique

```
Landing  ─►  Catalogue  ─►  Fiche produit  ─►  Panier  ─►  Commande
   │            │  + filtres                    │
   │            │                               └──► Login (si non auth)
   └─► Login / Register ─► (redirection) ─► Catalogue
                                              └─► Favoris ❤
```

## Fonctionnalités

| Fonction | Statut | Endpoint API | Composants frontend |
|----------|--------|--------------|---------------------|
| Inscription email | ✅ | `POST /auth/register` | `app/[locale]/register/page.tsx` |
| Connexion email | ✅ | `POST /auth/login` | `app/[locale]/login/page.tsx` |
| Connexion Google | ⚠️ Partiel (besoin `GOOGLE_CLIENT_ID`) | `GET /auth/google` | bouton Google sur `/login` |
| Connexion OTP SMS | ⚠️ Partiel (dev_code retourné si Twilio absent) | `POST /auth/otp/send` · `/auth/otp/verify` | `/login` onglet *SMS* |
| Catalogue + filtres | ✅ | `GET /products?category=&min_price=&max_price=&search=` | `components/catalogue/CatalogueExperience.tsx` |
| Fiche produit | ✅ | `GET /products/{id}` | `app/[locale]/product/[id]/page.tsx` |
| Panier (local) | ✅ | — (zustand persist) | `lib/cart-store.ts` |
| Ajout au panier (auth requis) | ✅ | — | `components/buyer/ProductCard.tsx` |
| Favoris (auth requis) | ✅ | `GET/POST/DELETE /favorites/{product_id}` | `app/[locale]/favoris/page.tsx`, `hooks/useFavorite.ts` |
| Commande | ✅ | `POST /orders` | `app/[locale]/checkout/page.tsx` |
| Paiement CMI | ⚠️ Partiel (sandbox) | `POST /payment/cmi/start` | `app/[locale]/checkout` |
| Mes commandes | ✅ | `GET /orders/mine` | `app/[locale]/orders/page.tsx` |
| Adresses | ✅ | `GET/POST /buyer/addresses` | `components/buyer/CodDeliveryForm.tsx` |
| Devenir vendeur | ✅ | `POST /sellers/apply` | `app/[locale]/seller-apply/page.tsx` |
| Chatbot FR/AR | ✅ | `POST /ai/chat` | `components/ai/ChatWidget.tsx` |

## Variables d'environnement utiles

- **Backend** : `JWT_SECRET`, `CORS_ORIGINS`
- **Frontend** : `NEXT_PUBLIC_API_URL`

## Flux d'authentification (front ↔ back)

```
Login form  ──POST /auth/login──►  FastAPI
   ▲                                   │
   │                                   ▼
   │                            {access_token, refresh_token}
   │
   └─◄── stocke en localStorage + cookie `access_token`
            ▼
        router.push(`/${locale}/catalogue`)
```

## Tests curl

```bash
# Inscription
curl -X POST http://localhost:8000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"buyer@test.ma","password":"buyer12345","full_name":"Test","language":"fr"}'

# Connexion
curl -X POST http://localhost:8000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"buyer@test.ma","password":"buyer12345"}'

# Catalogue filtré
curl "http://localhost:8000/products?min_price=50&max_price=500&page=1&page_size=12"

# Favoris (avec token)
TOKEN="<access_token>"
curl -X POST  http://localhost:8000/favorites/<product_uuid> -H "Authorization: Bearer $TOKEN"
curl -X GET   http://localhost:8000/favorites                -H "Authorization: Bearer $TOKEN"
curl -X DELETE http://localhost:8000/favorites/<product_uuid> -H "Authorization: Bearer $TOKEN"
```
