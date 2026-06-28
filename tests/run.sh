#!/usr/bin/env bash
# tests/run.sh — starttmux test orchestrator
# Copy to <app>/tests/run.sh and adapt. Must exit 0 when all enabled checks pass.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> starttmux test runner"

# --- PHP syntax (always) ---
echo "==> PHP lint"
php -l backend/*.php >/dev/null
echo "✓ php lint"

# --- API smoke (needs ./dev.sh start unless skipped) ---
if [[ "${SKIP_SMOKE:-}" != "1" ]]; then
  if bash tests/api-smoke.sh; then
    echo "✓ api-smoke"
  else
    if [[ "${REQUIRE_SMOKE:-}" == "1" ]]; then
      echo "FAIL: api-smoke (start ./dev.sh or set SKIP_SMOKE=1)" >&2
      exit 1
    fi
    echo "⚠ api-smoke skipped (dev server not up; set REQUIRE_SMOKE=1 to enforce)"
  fi
else
  echo "⚠ api-smoke skipped (SKIP_SMOKE=1)"
fi

# --- Node tests (if present) ---
if compgen -G "tests/*.test.js" >/dev/null; then
  if command -v node >/dev/null 2>&1; then
    node --test tests/*.test.js
    echo "✓ node tests"
  else
    echo "⚠ node tests skipped (node not installed)"
  fi
fi

# --- PHP unit tests (optional per-app) ---
if compgen -G "tests/unit/*.php" >/dev/null; then
  for f in tests/unit/*.php; do
    php "$f" && echo "✓ $(basename "$f")"
  done
fi

echo ""
echo "ALL PASS"