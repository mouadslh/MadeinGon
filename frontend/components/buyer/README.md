# Composants `buyer`

Composants Next.js dédiés au parcours **acheteur** (rôle USER).

| Fichier | Rôle | Endpoint API |
|---------|------|--------------|
| `ProductCard.tsx` | Carte produit (grid + favoris + cart auth-guard) | — (consomme `ProductCardData`) |
| `ProductGrid.tsx` | Grille animée (Framer Motion) | — |
| `CatalogueSkeleton.tsx` | Placeholder shimmer pendant le fetch | — |
| `CategoryFilter.tsx` | Filtre par catégorie (chips) | `GET /categories` |
| `RecommendationCarousel.tsx` | Reco IA personnalisée | `GET /ai/recommendations` |
| `CodDeliveryForm.tsx` | Formulaire de livraison (cash à la livraison) | `POST /orders` |

## Contrat `ProductCardData`

```ts
interface ProductCardData {
  id: string;
  seller_id?: string;
  title_fr: string;
  title_ar?: string | null;
  price: number;
  image_url?: string | null;
  authenticity_badge?: boolean;
  reason?: string; // pour les reco IA
}
```

## Règles métier

1. **Ajout au panier** — interdit si non connecté → toast + redirect
   vers `/login?redirect=…` (cf. `ProductCard.tsx`).
2. **Favoris** — bouton ❤ sur chaque carte, optimistic UI via
   `hooks/useFavorite.ts` ; non connecté ⇒ redirect login.
3. **Badge GON** — composant unique `<VerifiedBadge />` (interdit de
   recréer un badge inline).

Voir aussi [`docs/roles/USER/README.md`](../../../docs/roles/USER/README.md).
