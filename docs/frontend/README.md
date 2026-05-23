# Frontend — Next.js 14

> UI complète de **Made in GON** : landing, catalogue, parcours
> acheteur, espace vendeur et console admin. Next.js 14 App Router,
> Tailwind CSS, Framer Motion, next-intl (FR + AR RTL).

## Arborescence

```
frontend/
├── app/
│   ├── layout.tsx            # <html><body>… (RootLayout)
│   ├── globals.css           # tokens design + Tailwind
│   └── [locale]/
│       ├── layout.tsx        # NextIntl + chrome (Navbar/Footer)
│       ├── page.tsx          # Landing (LandingV2)
│       ├── catalogue/
│       ├── product/[id]/
│       ├── login/  register/  logout/
│       ├── favoris/          # ❤ favoris USER
│       ├── orders/  cart/  checkout/
│       ├── seller-apply/
│       ├── seller/           # dashboard SELLER
│       └── admin/            # console ADMIN
├── components/
│   ├── ui/                   # primitives (Button, Badge, VerifiedBadge, …)
│   ├── layout/               # Navbar, Footer, Chrome, Logo
│   ├── landing-v2/           # nouvelle landing page
│   ├── catalogue/            # CatalogueExperience (filtres + grille)
│   ├── buyer/                # ProductCard, ProductGrid, Cod form …
│   ├── seller/               # tableaux de bord, formulaires
│   ├── admin/                # modération
│   ├── goun/                 # composants de marque (intro, fonts, …)
│   ├── ai/                   # ChatWidget, VoiceFill, PhotoEnhancer
│   └── auth/                 # AuthLayout (split-screen)
├── lib/
│   ├── i18n.ts               # next-intl config (fr + ar)
│   ├── api.ts                # axios + intercepteur JWT refresh
│   ├── auth.ts               # JWT storage + role helpers
│   ├── auth-redirect.ts      # `getPostLoginRedirect()`
│   ├── cart-store.ts         # zustand persist
│   └── …
├── hooks/
│   └── useFavorite.ts        # toggle favori (optimistic)
├── messages/
│   ├── fr.json
│   └── ar.json
├── middleware.ts             # i18n + garde SELLER/ADMIN/checkout
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

## Lancement

```bash
cd frontend
cp -n .env.local.example .env.local       # NEXT_PUBLIC_API_URL
npm install
npm run dev                                # http://localhost:3000/fr
```

## Internationalisation

- `next-intl` (3.x) — fichiers de traduction sous `messages/`
- Locales : **`fr`** (défaut) + **`ar`** (RTL).
- URL toujours préfixée : `/fr/catalogue`, `/ar/catalogue`
- `<html lang dir>` mis à jour dynamiquement par
  `components/layout/LocaleHtmlAttributes.tsx`.

## Authentification (côté client)

| Module | Rôle |
|--------|------|
| `lib/api.ts` | Axios + injection `Authorization: Bearer` + refresh 401 |
| `lib/auth.ts` | Lecture/écriture localStorage + cookie `access_token` |
| `lib/auth-redirect.ts` | Cible après login (`?redirect=…` ou catalogue) |
| `middleware.ts` | Garde `/seller/*` (SELLER+), `/admin/*` (ADMIN), `/checkout` (auth) |

Le token est stocké en **localStorage** ET en cookie `access_token`
(HTTP-readable côté middleware Next.js, pas httpOnly — accepté pour
ce MVP).

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL de l'API FastAPI |

Aucune autre clé n'est exposée côté client.

## Composants partagés clés

| Composant | Fichier | Rôle |
|-----------|---------|------|
| `<Logo>` | `components/layout/Logo.tsx` | Logo unifié (Navbar/Footer/Intro) |
| `<VerifiedBadge>` | `components/ui/VerifiedBadge.tsx` | Badge « Vérifié GON » unifié |
| `<IntroAnimation>` | `components/IntroAnimation.tsx` | Cinématique 4-5 s à l'arrivée |
| `<AuthLayout>` | `components/auth/AuthLayout.tsx` | Split-screen login/register |
| `<ProductCard>` | `components/buyer/ProductCard.tsx` | Carte produit (cat. + favoris + cart) |

## Compatibilité front ↔ back

| Élément | Frontend attend | Backend renvoie |
|---------|-----------------|------------------|
| `id` | `string` (UUID) | UUID |
| Produits | `title_fr`, `title_ar`, `price`, `images[].url`, `authenticity_badge` | idem (cf. `ProductResponse`) |
| Pagination | `items`, `total`, `page`, `page_size` | idem |
| Filtres `/products` | `category_slug`, `min_price`, `max_price`, `search` | idem (cf. `routers/products.py`) |
| Favoris | `[{product_id, created_at, product:{…}}]` | idem (`routers/favorites.py`) |

## Lint & build

```bash
npm run lint
npm run build
```
