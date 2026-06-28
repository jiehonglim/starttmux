#!/usr/bin/env bash
# scripts/security-self-check.sh — backend pre-commit gate [TEMPLATE]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if ! compgen -G "backend/*.php" >/dev/null; then
  echo "No backend/*.php — skip"
  exit 0
fi

fail() { echo "SECURITY FAIL: $*" >&2; exit 1; }
warn() { echo "SECURITY WARN: $*" >&2; }

echo "==> PHP syntax"
php -l backend/*.php >/dev/null || fail "PHP parse error"

echo "==> Unvalidated superglobals"
if hits=$(grep -nE '\$_(GET|POST|REQUEST)\[' backend/*.php \
  | grep -vE 'filter_|htmlspecialchars|intval|in_array|validStore|validReturnPath|\?\?' || true); then
  [[ -z "$hits" ]] || warn "Review input handling:\n$hits"
fi

echo "==> Raw SQL queries"
if hits=$(grep -nE '->query\(' backend/*.php | grep -vE 'prepare|PRAGMA|migrate' || true); then
  [[ -z "$hits" ]] || fail "Possible raw query:\n$hits"
fi

echo "==> Debug leaks"
if grep -rnE 'var_dump|print_r|phpinfo' backend/; then
  fail "Debug output in backend/"
fi

echo "==> Hardcoded secrets"
if grep -nE 'sk_live_|sk_test_|STRIPE_SECRET|CLIENT_SECRET|DB_PASS' backend/*.php; then
  fail "Possible secret in source"
fi

if [[ "${SKIP_SECURITY_CURL:-}" == "1" ]]; then
  echo "⚠ curl checks skipped (SKIP_SECURITY_CURL=1)"
  echo "SECURITY PASS (partial)"
  exit 0
fi

FRONT_PORT="${FRONT_PORT:-8080}"
BACK_PORT="${BACK_PORT:-8081}"

echo "==> Sensitive path exposure (dev ports $FRONT_PORT / $BACK_PORT)"
for url in \
  "http://127.0.0.1:${FRONT_PORT}/.env" \
  "http://127.0.0.1:${FRONT_PORT}/backend/data.db" \
  "http://127.0.0.1:${BACK_PORT}/data.db"; do
  code="$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 "$url" 2>/dev/null || echo "000")"
  if [[ "$code" == "000" ]]; then
    warn "Could not reach $url (dev server down?)"
  elif [[ ! "$code" =~ ^(403|404)$ ]]; then
    fail "$url returned HTTP $code (expected 403/404)"
  else
    echo "✓ $url → $code"
  fi
done

echo "SECURITY PASS"