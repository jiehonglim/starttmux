# starttmux

Learn tmux by playing — a free browser puzzle game.

**Play:** [minitcp.com/projects/starttmux](https://minitcp.com/projects/starttmux)
**Source:** [github.com/jiehonglim/starttmux](https://github.com/jiehonglim/starttmux) (MIT License)

## What it is

**Cheat sheet**, **10 learn puzzles** (golden path + level up), and a **simulator** with fake Grok Build, Hermes, and Claude Code agents. No login, no paywall. Desktop keyboard or mobile tap controls.

- **Desktop:** prefix is **Ctrl+b**, then the tmux key (e.g. `%` to split vertically)
- **Mobile:** tap **⌃ b** and the shortcut keycaps in order (`?mode=mobile` to test on desktop)

## Run locally

Requires PHP 8+ (Homebrew: `brew install php`).

```bash
./dev.sh start
open http://127.0.0.1:8080
```

Stop with `./dev.sh stop`. Logs live in `.dev/logs/`.

## Tests

```bash
bash tests/run.sh              # SKIP_SMOKE=1 if dev server is down
bash scripts/security-self-check.sh
node --test tests/interpreter.test.js
node --test tests/mobile.test.js
```

## Project layout

| Path | Purpose |
| --- | --- |
| `frontend/` | Static site + vanilla JS tmux simulator |
| `backend/` | Minimal PHP health endpoint (local dev only) |
| `tests/` | Interpreter + mobile puzzle tests |

Game state lives entirely in the browser. See [`SPEC.md`](SPEC.md) for supported commands and scope.