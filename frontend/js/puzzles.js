/** @typedef {{ id?: string, r: number, c: number, h: number, w: number, label?: string, focused?: boolean }} PaneDef */
/** @typedef {{ name: string, panes: PaneDef[] }} WindowDef */
/** @typedef {{ windows: WindowDef[], activeWindow?: number }} PuzzleStart */
/** @typedef {{ windows: WindowDef[], activeWindow: number }} PuzzleGoal */

/** @typedef {{
 *   id: number,
 *   pathOrder: number,
 *   pathTitle: string,
 *   title: string,
 *   bucket: string,
 *   hint: string,
 *   agentTip: string,
 *   shortcut: string,
 *   estSeconds: number,
 *   start: PuzzleStart,
 *   goal: PuzzleGoal,
 *   acceptedSolutions: string[][],
 *   minSteps: number,
 *   mobile?: { type: 'sequence', steps: string[], keycaps: string[], hint: string },
 * }} Puzzle */

/** @param {PuzzleStart| PuzzleGoal} raw */
function normalizeSnapshot(raw) {
  return {
    activeWindow: raw.activeWindow ?? 0,
    windows: raw.windows.map((w) => ({
      name: w.name,
      panes: w.panes
        .map((p) => ({
          id: p.id ?? 'p0',
          r: p.r,
          c: p.c,
          h: p.h,
          w: p.w,
          focused: !!p.focused,
        }))
        .sort((a, b) => a.id.localeCompare(b.id)),
    })),
  };
}

/** @param {Puzzle} puzzle */
export function goalSnapshot(puzzle) {
  return normalizeSnapshot(puzzle.goal);
}

export const PUZZLES = /** @type {Puzzle[]} */ ([
  {
    id: 1,
    pathOrder: 1,
    pathTitle: 'Side-by-side',
    title: 'Side-by-side',
    bucket: 'Golden path · step 1',
    hint: 'Split vertically: prefix + % — agent left, your shell right.',
    agentTip: 'Run your coding agent in one pane; keep git and npm in the other.',
    shortcut: '⌃ b %',
    estSeconds: 45,
    start: {
      windows: [{
        name: 'agent',
        panes: [{ id: 'p0', r: 0, c: 0, h: 100, w: 100, label: 'agent', focused: true }],
      }],
      activeWindow: 0,
    },
    goal: {
      activeWindow: 0,
      windows: [{
        name: 'agent',
        panes: [
          { id: 'p0', r: 0, c: 0, h: 100, w: 50, focused: false, label: 'agent' },
          { id: 'p1', r: 0, c: 50, h: 100, w: 50, focused: true, label: 'shell' },
        ],
      }],
    },
    acceptedSolutions: [['prefix', '%']],
    minSteps: 2,
    mobile: {
      type: 'sequence',
      steps: ['prefix', '%'],
      keycaps: ['prefix', '%', 'c', '"', 'ArrowRight'],
      hint: 'Tap ⌃ b, then % to park the agent beside your shell.',
    },
  },
  {
    id: 2,
    pathOrder: 2,
    pathTitle: 'Check the agent',
    title: 'Check the agent',
    bucket: 'Golden path · step 2',
    hint: 'Move focus with prefix + arrow keys — peek at agent output, then back to your shell.',
    agentTip: 'Glance at what the agent printed without losing your command line.',
    shortcut: '⌃ b →',
    estSeconds: 60,
    start: {
      windows: [{
        name: 'agent',
        panes: [
          { id: 'p0', r: 0, c: 0, h: 50, w: 50, label: 'agent', focused: true },
          { id: 'p1', r: 0, c: 50, h: 50, w: 50, label: 'shell', focused: false },
          { id: 'p2', r: 50, c: 0, h: 50, w: 100, label: 'tests', focused: false },
        ],
      }],
      activeWindow: 0,
    },
    goal: {
      activeWindow: 0,
      windows: [{
        name: 'agent',
        panes: [
          { id: 'p0', r: 0, c: 0, h: 50, w: 50, focused: false },
          { id: 'p1', r: 0, c: 50, h: 50, w: 50, focused: true },
          { id: 'p2', r: 50, c: 0, h: 50, w: 100, focused: false },
        ],
      }],
    },
    acceptedSolutions: [['prefix', 'ArrowRight']],
    minSteps: 2,
    mobile: {
      type: 'sequence',
      steps: ['prefix', 'ArrowRight'],
      keycaps: ['prefix', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'],
      hint: 'Tap ⌃ b, then → to jump focus to the shell pane.',
    },
  },
  {
    id: 3,
    pathOrder: 4,
    pathTitle: 'New agent window',
    title: 'New agent window',
    bucket: 'Golden path · step 4',
    hint: 'Open a fresh window with prefix + c — tmux jumps you there for a second agent or repo.',
    agentTip: 'One window per project keeps Claude, Cursor, and long jobs from colliding.',
    shortcut: '⌃ b c',
    estSeconds: 75,
    start: {
      windows: [{
        name: 'agent',
        panes: [{ id: 'p0', r: 0, c: 0, h: 100, w: 100, label: 'agent', focused: true }],
      }],
      activeWindow: 0,
    },
    goal: {
      activeWindow: 1,
      windows: [
        {
          name: 'agent',
          panes: [{ id: 'p0', r: 0, c: 0, h: 100, w: 100, focused: false }],
        },
        {
          name: 'win1',
          panes: [{ id: 'p1', r: 0, c: 0, h: 100, w: 100, focused: true, label: 'agent2' }],
        },
      ],
    },
    acceptedSolutions: [
      ['prefix', 'c'],
      ['prefix', 'c', 'prefix', '1'],
    ],
    minSteps: 2,
    mobile: {
      type: 'sequence',
      steps: ['prefix', 'c'],
      keycaps: ['prefix', 'c', 'n', 'p', '1'],
      hint: 'Tap ⌃ b, then c to spawn a new agent window.',
    },
  },
  {
    id: 4,
    pathOrder: 3,
    pathTitle: 'Logs below',
    title: 'Logs below',
    bucket: 'Golden path · step 3',
    hint: 'Split horizontally: prefix + " — agent on top, streaming logs or tests below.',
    agentTip: 'Watch vitest, tail, or deploy output without covering the agent transcript.',
    shortcut: '⌃ b "',
    estSeconds: 60,
    start: {
      windows: [{
        name: 'agent',
        panes: [{ id: 'p0', r: 0, c: 0, h: 100, w: 100, label: 'agent', focused: true }],
      }],
      activeWindow: 0,
    },
    goal: {
      activeWindow: 0,
      windows: [{
        name: 'agent',
        panes: [
          { id: 'p0', r: 0, c: 0, h: 50, w: 100, focused: false },
          { id: 'p1', r: 50, c: 0, h: 50, w: 100, focused: true, label: 'logs' },
        ],
      }],
    },
    acceptedSolutions: [['prefix', '"']],
    minSteps: 2,
    mobile: {
      type: 'sequence',
      steps: ['prefix', '"'],
      keycaps: ['prefix', '"', '%', 'ArrowDown', 'c'],
      hint: 'Tap ⌃ b, then " to stack logs under the agent.',
    },
  },
  {
    id: 5,
    pathOrder: 5,
    pathTitle: 'Flip agents',
    title: 'Flip agents',
    bucket: 'Golden path · step 5',
    hint: 'Hop to the next window with prefix + n (or prefix + 1 to jump straight there).',
    agentTip: 'Swap between two agent sessions the way you alt-tab between apps.',
    shortcut: '⌃ b n',
    estSeconds: 45,
    start: {
      windows: [
        {
          name: 'agent',
          panes: [{ id: 'p0', r: 0, c: 0, h: 100, w: 100, label: 'agent', focused: true }],
        },
        {
          name: 'win1',
          panes: [{ id: 'p1', r: 0, c: 0, h: 100, w: 100, label: 'agent2', focused: false }],
        },
      ],
      activeWindow: 0,
    },
    goal: {
      activeWindow: 1,
      windows: [
        {
          name: 'agent',
          panes: [{ id: 'p0', r: 0, c: 0, h: 100, w: 100, focused: false }],
        },
        {
          name: 'win1',
          panes: [{ id: 'p1', r: 0, c: 0, h: 100, w: 100, focused: true, label: 'agent2' }],
        },
      ],
    },
    acceptedSolutions: [['prefix', 'n'], ['prefix', '1']],
    minSteps: 2,
    mobile: {
      type: 'sequence',
      steps: ['prefix', 'n'],
      keycaps: ['prefix', 'n', 'p', '1', 'c'],
      hint: 'Tap ⌃ b, then n to flip to the other agent window.',
    },
  },
]);

/** @param {number} id */
export function getPuzzle(id) {
  return PUZZLES.find((p) => p.id === id) ?? null;
}

export function listPuzzles() {
  return PUZZLES;
}

/** @param {Puzzle[]} [puzzles] */
export function listPuzzlesByPath(puzzles = PUZZLES) {
  return [...puzzles].sort((a, b) => a.pathOrder - b.pathOrder);
}