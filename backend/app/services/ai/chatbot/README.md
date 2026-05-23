# Chatbot — Support client

## Rôle

Répond aux questions acheteurs (livraison, paiement, retours) en **français** ou **arabe**.

## Fichier

| Fichier | Responsabilité |
|---------|----------------|
| `chatbot_service.py` | Prompt système + injection statut commande + détection handoff humain |

## Endpoint

`POST /ai/chat` — **public**

## Handoff humain

Mots-clés sensibles (arnaque, tribunal, …) → `handoff: true` + message d'escalade.

## Frontend

Composant `components/ai/ChatWidget.tsx` (bulle fixe bas-droite).
