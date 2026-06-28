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
  { keys: ['⌃ b', 'p'], action: 'Previous window', when: 'Flip back to the prior session', inGame: false },
  { keys: ['⌃ b', '0–9'], action: 'Jump to window', when: 'Land on window 0–9 directly', inGame: true },
];

/** @type {AppendixCmd[]} */
export const APPENDIX_COMMANDS = [
  { key: 'z', label: '⌃ b z', action: 'Zoom pane', when: 'Fullscreen one pane while an agent runs' },
  { key: 'x', label: '⌃ b x', action: 'Close pane', when: 'Kill a finished agent or stale shell' },
  { key: 'd', label: '⌃ b d', action: 'Detach session', when: 'Leave agents running; reattach later' },
  { key: ',', label: '⌃ b ,', action: 'Rename window', when: 'Label windows: agent, tests, deploy' },
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

/** @param {import('./puzzles.js').Puzzle[]} puzzles */
export function goldenPathSteps(puzzles) {
  return [...puzzles]
    .sort((a, b) => a.pathOrder - b.pathOrder)
    .map((p) => ({
      pathOrder: p.pathOrder,
      levelId: p.id,
      pathTitle: p.pathTitle,
      agentTip: p.agentTip,
      shortcut: p.shortcut,
    }));
}

/** @param {import('./puzzles.js').Puzzle[]} puzzles @param {number} levelId */
export function nextPathLevel(puzzles, levelId) {
  const sorted = [...puzzles].sort((a, b) => a.pathOrder - b.pathOrder);
  const idx = sorted.findIndex((p) => p.id === levelId);
  if (idx < 0 || idx >= sorted.length - 1) return null;
  return sorted[idx + 1];
}