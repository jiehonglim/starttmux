#!/usr/bin/env bash
set -euo pipefail

BACKEND_PORT="${BACKEND_PORT:-8081}"
FRONTEND_PORT="${FRONTEND_PORT:-8080}"

curl -sf "http://127.0.0.1:${BACKEND_PORT}/index.php?action=health" | grep -q '"ok":true'
curl -sf -o /dev/null "http://127.0.0.1:${FRONTEND_PORT}/index.html"
curl -sf -o /dev/null "http://127.0.0.1:${FRONTEND_PORT}/play.html?level=1"

echo "api-smoke ok"