# YOLO — Amélioration photo produit

## Rôle

Améliore les photos prises par les artisans (souvent fond désordonné) pour un rendu catalogue professionnel.

## Fichier

| Fichier | Responsabilité |
|---------|----------------|
| `yolo_service.py` | Détection bbox (YOLOv8 en prod), suppression fond (rembg), fond blanc ou dune |

## Endpoint

`POST /ai/photo/enhance` — réservé **SELLER**

## MVP vs Production

| MVP (actuel) | Production |
|--------------|------------|
| Crop centre + Pillow | YOLOv8 (`ultralytics`) |
| Fond couleur unie | `rembg` + texture dune |
| URLs locales | Upload S3 / R2 |

## Paramètres

- `background`: `white` | `dune`
