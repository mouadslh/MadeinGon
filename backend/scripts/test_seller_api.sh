#!/bin/sh
# Test seller API endpoints
set -e
API="${API:-http://localhost:8000}"
EMAIL="${EMAIL:-artisan@madeingoun.ma}"
PASS="${PASS:-seller12345}"

echo "=== Login seller ==="
LOGIN=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}")
TOKEN=$(echo "$LOGIN" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null || echo "")
if [ -z "$TOKEN" ]; then
  echo "LOGIN FAILED: $LOGIN"
  exit 1
fi
echo "OK token obtained"

AUTH="Authorization: Bearer $TOKEN"

echo ""
echo "=== GET /seller/orders/counts ==="
curl -s -H "$AUTH" "$API/seller/orders/counts" | python3 -m json.tool

echo ""
echo "=== GET /seller/orders ==="
ORDERS=$(curl -s -H "$AUTH" "$API/seller/orders?limit=5")
echo "$ORDERS" | python3 -m json.tool 2>/dev/null | head -60

echo ""
echo "=== GET /seller/wallet ==="
curl -s -H "$AUTH" "$API/seller/wallet?page=1&limit=5" | python3 -m json.tool

echo ""
echo "=== GET /seller/wallet/stats?period=30d ==="
curl -s -H "$AUTH" "$API/seller/wallet/stats?period=30d" | python3 -m json.tool

echo ""
echo "=== GET /seller/notifications/unread-count ==="
curl -s -H "$AUTH" "$API/seller/notifications/unread-count" | python3 -m json.tool

echo ""
echo "=== GET /seller/notifications ==="
curl -s -H "$AUTH" "$API/seller/notifications?limit=5" | python3 -m json.tool

ORDER_ID=$(echo "$ORDERS" | python3 -c "
import sys,json
d=json.load(sys.stdin)
o=d.get('orders',[])
print(o[0]['id'] if o else '')
" 2>/dev/null || echo "")

if [ -n "$ORDER_ID" ]; then
  echo ""
  echo "=== GET /seller/orders/$ORDER_ID ==="
  curl -s -H "$AUTH" "$API/seller/orders/$ORDER_ID" | python3 -m json.tool | head -40
else
  echo ""
  echo "=== No orders — creating test order via buyer would be needed ==="
fi

echo ""
echo "=== POST /payment/cmi/initiate (expect 404 or 400 without buyer order) ==="
curl -s -o /dev/null -w "HTTP %{http_code}\n" -H "$AUTH" -H "Content-Type: application/json" \
  -d '{"order_id":"00000000-0000-0000-0000-000000000001"}' \
  -X POST "$API/payment/cmi/initiate"

echo ""
echo "=== All seller endpoint smoke tests done ==="
