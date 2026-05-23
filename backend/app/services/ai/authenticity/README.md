# Authenticity — Détection d'authenticité

## Rôle

Attribue un score 0–100 et le badge **« Vérifié Authentique GOUN »** aux produits artisanaux.

## Fichier

| Fichier | Responsabilité |
|---------|----------------|
| `authenticity_service.py` | Heuristiques EXIF, résolution, reverse-search simulé |

## Endpoint

`POST /ai/authenticity/check` — réservé **SELLER**

## Seuils

| Score | Action |
|-------|--------|
| ≥ 80 | Badge activé |
| < 50 | Modération admin obligatoire |
| 50–79 | Publication possible, sans badge |

## Production

- Google Lens / SerpAPI pour reverse image search
- YOLOv8 pour cohérence image ↔ catégorie déclarée
