#!/bin/sh
set -e

API_URL="${API_INTERNAL_URL:-http://backend:8000}"
echo "Waiting for backend at $API_URL ..."

i=0
until wget -q -O /dev/null "$API_URL/health" 2>/dev/null || [ $i -ge 60 ]; do
  i=$((i + 1))
  sleep 2
done

if [ $i -ge 60 ]; then
  echo "Backend not ready — starting frontend anyway."
fi

exec npm run dev
