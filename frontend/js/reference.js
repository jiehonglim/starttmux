/** @typedef {{ keys: string[], action: string, when: string, inGame: boolean }} Shortcut */
/** @typedef {{ key: string, label: string, action: string, when: string }} AppendixCmd */

export const PREFIX_NOTE = {
  title: 'The prefix',
  keys: '⌃ b',
  body: 'Almost every tmux command starts with Ctrl+b, then a second key. Tap ⌃ b, release, then the shortcut — same rhythm you practice in the puzzles.',
  agentLine: 'Muscle memory here keeps you fast when juggling agent terminals, git, and test output.',
};

/** @type {Shortcut[]} */
export const PANE_SHORTCUTS = [
  { keys: ['⌃ b', '%'], action: 'Split vertical', when: 'Agent on the left, your shell on the right', inGame: true },
  { keys: ['⌃ b', '"'], action: 'Split horizontal', when: 'Agent on top, logs or tests below', inGame: true },
  { keys: ['⌃ b', '←'], action: 'Focus left', when: 'Jump to the pane on your left', inGame: true },
  { keys: ['⌃ b', '→'], action: 'Focus right', when: 'Jump to the pane on your right', inGame: true },
  { keys: ['⌃ b', '↑'], action: 'Focus up', when: 'Jump to the pane above', inGame: true },
  { keys: ['⌃ b', '↓'], action: 'Focus down', when: 'Jump to the pane below', inGame: true },
];

/** @type {Shortcut[]} */
export const WINDOW_SHORTCUTS = [
  { keys: ['⌃ b', 'c'], action: 'New window', when: 'Spin up a second agent or side project', inGame: true },
  { keys: ['⌃ b', 'n'], action: 'Next window', when: 'Flip to the next agent session', inGame: true },
  { keys: ['⌃ b', 'p'], action: 'Previous window', when: 'Flip back to the prior session', inGame: true },
  { keys: ['⌃ b', '0–9'], action: 'Jump to window', when: 'Land on window 0–9 directly', inGame: true },
];

/** @type {AppendixCmd[]} */
export const PANE_MGMT_SHORTCUTS = [
  { keys: ['⌃ b', 'x'], action: 'Close pane', when: 'Kill a finished agent or stale shell', inGame: true },
  { keys: ['⌃ b', 'z'], action: 'Zoom pane', when: 'Fullscreen one pane while an agent runs', inGame: true },
  { keys: ['⌃ b', ','], action: 'Rename window', when: 'Label windows: agent, tests, deploy', inGame: true },
];

/** @type {import('./reference.js').Shortcut[]} */
export const FILE_COMMANDS = [
  { keys: ['pwd'], action: 'Print working directory', when: 'See where you are in the project', inGame: false },
  { keys: ['ls'], action: 'List files', when: 'Peek at the repo without a GUI', inGame: false },
  { keys: ['cd'], action: 'Change directory', when: 'Move into src, tests, or logs', inGame: false },
  { keys: ['cat'], action: 'Show file contents', when: 'Read package.json or a script', inGame: false },
  { keys: ['clear'], action: 'Clear screen', when: 'Tidy a noisy pane', inGame: false },
];

export const APPENDIX_COMMANDS = [
  { key: 'd', label: '⌃ b d', action: 'Detach session', when: 'Leave agents running; reattach later' },
];

export const LAYOUT_ASCII = `┌─ window 0: primary agent ─────────────────────┐
│ ┌─ agent ──────────┐ ┌─ your shell ──────────┐ │
│ │ claude / cursor  │ │ git · npm · deploy    │ │
│ └──────────────────┘ └───────────────────────┘ │
│ ┌─ tests / logs ─────────────────────────────┐ │
│ │ tail -f or vitest watch                  │ │
│ └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
┌─ window 1: second agent or long-running job ─┐
│  another project · background worker           │
└────────────────────────────────────────────────┘`;

export const WORKFLOW_INTRO = {
  title: 'Agent control room',
  body: 'One tmux session is your persistent workspace. Windows hold separate agents or projects. Panes split agent output from your shell and streaming logs — so nothing disappears when you context-switch.',
};

/** @param {import('./puzzles.js').Puzzle[]} puzzles @param {'golden' | 'levelup'} track */
function trackSteps(puzzles, track) {
  return [...puzzles]
    .filter((p) => p.track === track)
    .sort((a, b) => a.pathOrder - b.pathOrder)
    .map((p) => ({
      pathOrder: p.pathOrder,
      levelId: p.id,
      pathTitle: p.pathTitle,
      agentTip: p.agentTip,
      shortcut: p.shortcut,
      track: p.track,
    }));
}

/** @param {import('./puzzles.js').Puzzle[]} puzzles */
export function goldenPathSteps(puzzles) {
  return trackSteps(puzzles, 'golden');
}

/** @param {import('./puzzles.js').Puzzle[]} puzzles */
export function levelUpSteps(puzzles) {
  return trackSteps(puzzles, 'levelup');
}

/** @param {import('./puzzles.js').Puzzle[]} puzzles @param {number} levelId */
export function nextPathLevel(puzzles, levelId) {
  const current = puzzles.find((p) => p.id === levelId);
  if (!current) return null;
  const sorted = puzzles
    .filter((p) => p.track === current.track)
    .sort((a, b) => a.pathOrder - b.pathOrder);
  const idx = sorted.findIndex((p) => p.id === levelId);
  if (idx < 0 || idx >= sorted.length - 1) return null;
  return sorted[idx + 1];
}

/** @param {import('./puzzles.js').Puzzle[]} puzzles @param {number} levelId */
export function nextPlayableLevel(puzzles, levelId) {
  const next = nextPathLevel(puzzles, levelId);
  if (next) return next;
  const current = puzzles.find((p) => p.id === levelId);
  if (current?.track === 'golden' && current.pathOrder === 5) {
    return puzzles.find((p) => p.track === 'levelup' && p.pathOrder === 1) ?? null;
  }
  return null;
}