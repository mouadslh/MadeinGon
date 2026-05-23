# Rôles — Made in GON

Le système d'autorisation est basé sur **trois rôles** stockés dans la
colonne `users.role` et embarqués dans le JWT (`payload.role`).

| Rôle     | Description                                  | Routes garanties |
|----------|----------------------------------------------|------------------|
| `USER`   | Acheteur (par défaut à l'inscription)        | catalogue, panier, commandes, favoris |
| `SELLER` | Artisan validé par un admin                  | Tout `USER` + `/seller/*` |
| `ADMIN`  | Administrateur de la plateforme              | Tout + `/admin/*` |

## Décodage et routage

- **Backend** : `app/core/deps.py` — `CurrentUser`, `SellerUser`,
  `AdminUser`, `OptionalUser` (gardes via `Depends`).
- **Frontend** : `frontend/middleware.ts` lit le cookie `access_token`,
  décode la payload et redirige selon le rôle.
- Helper post-login : `frontend/lib/auth-redirect.ts`.

## Documents détaillés

- [USER/](./USER/README.md) — Parcours acheteur
- [SELLER/](./SELLER/README.md) — Parcours artisan
- [ADMIN/](./ADMIN/README.md) — Modération & supervision
