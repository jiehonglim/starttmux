# SPEC — starttmux

> Status: **v2** (10 puzzles + simulator + cheat sheet)

## Current scope

- **Three pillars:** cheat sheet, learn (puzzles), simulator (free play)
- Desktop keyboard + mobile touch for puzzles; simulator has shell typing (desktop) or tap-to-run (mobile)
- **Golden path** — 5 steps (IDs 1–5, stable URLs)
- **Level up** — 5 steps (IDs 6–10): close pane, zoom, previous window, rename, control-room capstone
- **Simulator** at `simulator.html` — fake project, agents (`grok-build`, `hermes`, `claude-code`), `npm test`, `tail -f`, deploy script
- **File basics in simulator:** `pwd`, `ls`, `cd`, `cat`, `clear`, `help`
- Tmux in game/sim: `%` `"` arrows `c` `n` `p` `x` `z` `,` `0`–`9`
- Win screen: keyboard continue (Enter); golden path flows into level up, then simulator
- Easter egg: `cow say tmux` in simulator
- Separate `localStorage` for desktop vs mobile bests
- Dark/light theme

## Not in this release

Copy mode, detach puzzle, hints, share block, payments, daily scheduler, accounts, server-side game API.

## Possible next steps

Copy mode in simulator, daily puzzle mode, spoiler-free share.