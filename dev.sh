#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEV_DIR="$ROOT/.dev"
LOG_DIR="$DEV_DIR/logs"
BACKEND_PID="$DEV_DIR/backend.pid"
FRONTEND_PID="$DEV_DIR/frontend.pid"
BACKEND_PORT="${BACKEND_PORT:-8081}"
FRONTEND_PORT="${FRONTEND_PORT:-8080}"

find_php() {
  if command -v php >/dev/null 2>&1; then
    command -v php
    return
  fi
  for candidate in /opt/homebrew/bin/php /usr/local/bin/php; do
    if [[ -x "$candidate" ]]; then
      echo "$candidate"
      return
    fi
  done
  echo "PHP not found. Install with: brew install php" >&2
  exit 1
}

PHP_BIN="$(find_php)"

port_in_use() {
  lsof -ti ":$1" >/dev/null 2>&1
}

pid_alive() {
  kill -0 "$1" 2>/dev/null
}

read_pid() {
  [[ -f "$1" ]] && cat "$1"
}

stop_pid_file() {
  local name="$1" file="$2" pid
  pid="$(read_pid "$file" || true)"
  if [[ -n "${pid:-}" ]] && pid_alive "$pid"; then
    echo "Stopping $name (pid $pid)..."
    kill "$pid" 2>/dev/null || true
    for _ in {1..20}; do pid_alive "$pid" || break; sleep 0.2; done
    pid_alive "$pid" && kill -9 "$pid" 2>/dev/null || true
  fi
  rm -f "$file"
}

cmd_start() {
  mkdir -p "$LOG_DIR"
  local backend_pid frontend_pid
  backend_pid="$(read_pid "$BACKEND_PID" || true)"
  frontend_pid="$(read_pid "$FRONTEND_PID" || true)"

  if [[ -n "${backend_pid:-}" ]] && pid_alive "$backend_pid"; then
    echo "Backend already running (pid $backend_pid) on :$BACKEND_PORT"
  else
    rm -f "$BACKEND_PID"
    port_in_use "$BACKEND_PORT" && { echo "Port $BACKEND_PORT in use. Run: $0 stop" >&2; exit 1; }
    echo "Starting backend on http://127.0.0.1:$BACKEND_PORT ..."
    (cd "$ROOT/backend" && nohup "$PHP_BIN" -S "0.0.0.0:$BACKEND_PORT" \
      >"$LOG_DIR/backend.log" 2>&1 & echo $! >"$BACKEND_PID")
    sleep 0.4
  fi

  if [[ -n "${frontend_pid:-}" ]] && pid_alive "$frontend_pid"; then
    echo "Frontend already running (pid $frontend_pid) on :$FRONTEND_PORT"
  else
    rm -f "$FRONTEND_PID"
    port_in_use "$FRONTEND_PORT" && { echo "Port $FRONTEND_PORT in use. Run: $0 stop" >&2; exit 1; }
    echo "Starting frontend on http://127.0.0.1:$FRONTEND_PORT ..."
    (cd "$ROOT/frontend" && nohup "$PHP_BIN" -S "0.0.0.0:$FRONTEND_PORT" router.php \
      >"$LOG_DIR/frontend.log" 2>&1 & echo $! >"$FRONTEND_PID")
    sleep 0.4
  fi

  cmd_status
  echo ""
  echo "Open: http://127.0.0.1:$FRONTEND_PORT/"
}

cmd_stop() {
  stop_pid_file "backend" "$BACKEND_PID"
  stop_pid_file "frontend" "$FRONTEND_PID"
  for port in "$BACKEND_PORT" "$FRONTEND_PORT"; do
    pids="$(lsof -ti ":$port" 2>/dev/null || true)"
    [[ -n "$pids" ]] && kill $pids 2>/dev/null || true
  done
  echo "Stopped."
}

cmd_status() {
  local backend_pid frontend_pid
  backend_pid="$(read_pid "$BACKEND_PID" || true)"
  frontend_pid="$(read_pid "$FRONTEND_PID" || true)"

  if [[ -n "${backend_pid:-}" ]] && pid_alive "$backend_pid"; then
    if curl -sf "http://localhost:$BACKEND_PORT/index.php?action=health" >/dev/null 2>&1; then
      echo "Backend:  running (pid $backend_pid, :$BACKEND_PORT) — up"
    else
      echo "Backend:  running (pid $backend_pid, :$BACKEND_PORT) — not responding"
    fi
  else
    echo "Backend:  stopped"
  fi

  if [[ -n "${frontend_pid:-}" ]] && pid_alive "$frontend_pid"; then
    if curl -sf "http://localhost:$FRONTEND_PORT/index.html" >/dev/null 2>&1; then
      echo "Frontend: running (pid $frontend_pid, :$FRONTEND_PORT) — up"
    else
      echo "Frontend: running (pid $frontend_pid, :$FRONTEND_PORT) — not responding"
    fi
  else
    echo "Frontend: stopped"
  fi
}

case "${1:-}" in
  start)   cmd_start ;;
  stop)    cmd_stop ;;
  restart) cmd_stop; cmd_start ;;
  status)  cmd_status ;;
  *) echo "Usage: $0 {start|stop|restart|status}"; exit 1 ;;
esac