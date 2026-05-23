.PHONY: up up-d down logs build restart deps deps-down dev-backend dev-frontend

# Démarre toute la plateforme (Postgres + Redis + API + Frontend)
up:
	docker compose up --build

up-d:
	docker compose up --build -d

down:
	docker compose down

logs:
	docker compose logs -f

build:
	docker compose build

restart:
	docker compose down && docker compose up --build

# Postgres + Redis seulement (moins lourd) — backend/frontend en local
deps:
	docker compose -f docker-compose.deps.yml up -d

deps-down:
	docker compose -f docker-compose.deps.yml down

dev-backend:
	cd backend && \
	  (test -d .venv || python3 -m venv .venv) && \
	  .venv/bin/pip install -q -r requirements.txt && \
	  .venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	cd frontend && ulimit -Sn 65536 && npm run dev
