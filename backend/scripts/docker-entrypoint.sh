#!/bin/bash
set -e

echo "==> Made in GON — Backend startup"

echo "Waiting for PostgreSQL..."
until pg_isready -h postgres -U madeingoun -d madeingoun -q; do
  sleep 1
done
echo "PostgreSQL is ready."

if [ -f alembic.ini ]; then
  echo "Running migrations..."
  alembic upgrade head
fi

if [ -f scripts/seed_demo.py ] && [ -s scripts/seed_demo.py ]; then
  echo "Seeding demo data (idempotent)..."
  python -m scripts.seed_demo || echo "Seed skipped or already applied."
fi

echo "Starting API server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
