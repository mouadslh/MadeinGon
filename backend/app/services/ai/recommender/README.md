# Recommender — Produits personnalisés

## Rôle

Suggère des produits sur la homepage selon l'historique de navigation (table `user_behavior`).

## Fichier

| Fichier | Responsabilité |
|---------|----------------|
| `recommender_service.py` | Scoring par catégories + poids événements |

## Endpoint

`GET /ai/recommendations` — **public** (user_id ou session_id optionnels)

## Poids des événements

| Événement | Poids |
|-----------|-------|
| PURCHASE | 3.0 |
| CART | 2.0 |
| WISHLIST | 1.5 |
| VIEW | 1.0 |

## Fallback

Visiteur sans historique → top produits de la semaine (`views_count`).
