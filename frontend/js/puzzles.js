/** @typedef {{ id?: string, r: number, c: number, h: number, w: number, label?: string, focused?: boolean }} PaneDef */
/** @typedef {{ name: string, panes: PaneDef[] }} WindowDef */
/** @typedef {{ windows: WindowDef[], activeWindow?: number }} PuzzleStart */
/** @typedef {{ windows: WindowDef[], activeWindow: number }} PuzzleGoal */

/** @typedef {{
 *   id: number,
 *   title: string,
 *   bucket: string,
 *   hint: string,
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
    title: 'First Split',
    bucket: 'Prefix + panes',
    hint: 'Use the tmux prefix (Ctrl+b), then % to split vertically.',
    estSeconds: 45,
    start: {
      windows: [{
        name: 'shell',
        panes: [{ id: 'p0', r: 0, c: 0, h: 100, w: 100, label: 'main', focused: true }],
      }],
      activeWindow: 0,
    },
    goal: {
      activeWindow: 0,
      windows: [{
        name: 'shell',
        panes: [
          { id: 'p0', r: 0, c: 0, h: 100, w: 50, focused: false },
          { id: 'p1', r: 0, c: 50, h: 100, w: 50, focused: true },
        ],
      }],
    },
    acceptedSolutions: [['prefix', '%']],
    minSteps: 2,
    mobile: {
      type: 'sequence',
      steps: ['prefix', '%'],
      keycaps: ['prefix', '%', 'c', '"', 'ArrowRight'],
      hint: 'Tap the shortcut in order: ⌃ b, then %.',
    },
  },
  {
    id: 2,
    title: 'Find Focus',
    bucket: 'Pane control',
    hint: 'Move focus with prefix + arrow keys. Reach the highlighted pane.',
    estSeconds: 60,
    start: {
      windows: [{
        name: 'shell',
        panes: [
          { id: 'p0', r: 0, c: 0, h: 50, w: 50, label: 'alpha', focused: true },
          { id: 'p1', r: 0, c: 50, h: 50, w: 50, label: 'beta', focused: false },
          { id: 'p2', r: 50, c: 0, h: 50, w: 100, label: 'gamma', focused: false },
        ],
      }],
      activeWindow: 0,
    },
    goal: {
      activeWindow: 0,
      windows: [{
        name: 'shell',
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
      hint: 'Tap ⌃ b, then the right arrow to move focus.',
    },
  },
  {
    id: 3,
    title: 'New Window',
    bucket: 'Windows',
    hint: 'Create a new window with prefix + c — tmux jumps you there automatically.',
    estSeconds: 75,
    start: {
      windows: [{
        name: 'shell',
        panes: [{ id: 'p0', r: 0, c: 0, h: 100, w: 100, label: 'main', focused: true }],
      }],
      activeWindow: 0,
    },
    goal: {
      activeWindow: 1,
      windows: [
        {
          name: 'shell',
          panes: [{ id: 'p0', r: 0, c: 0, h: 100, w: 100, focused: false }],
        },
        {
          name: 'win1',
          panes: [{ id: 'p1', r: 0, c: 0, h: 100, w: 100, focused: true }],
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
      hint: 'Tap ⌃ b, then c to open a new window.',
    },
  },
  {
    id: 4,
    title: 'Horizontal Split',
    bucket: 'Pane control',
    hint: 'Split the pane horizontally with prefix + " (Shift+\').',
    estSeconds: 60,
    start: {
      windows: [{
        name: 'shell',
        panes: [{ id: 'p0', r: 0, c: 0, h: 100, w: 100, label: 'main', focused: true }],
      }],
      activeWindow: 0,
    },
    goal: {
      activeWindow: 0,
      windows: [{
        name: 'shell',
        panes: [
          { id: 'p0', r: 0, c: 0, h: 50, w: 100, focused: false },
          { id: 'p1', r: 50, c: 0, h: 50, w: 100, focused: true },
        ],
      }],
    },
    acceptedSolutions: [['prefix', '"']],
    minSteps: 2,
    mobile: {
      type: 'sequence',
      steps: ['prefix', '"'],
      keycaps: ['prefix', '"', '%', 'ArrowDown', 'c'],
      hint: 'Tap ⌃ b, then " to split top and bottom.',
    },
  },
  {
    id: 5,
    title: 'Switch Window',
    bucket: 'Windows',
    hint: 'Move to the next window with prefix + n (or prefix + 1 to jump directly).',
    estSeconds: 45,
    start: {
      windows: [
        {
          name: 'shell',
          panes: [{ id: 'p0', r: 0, c: 0, h: 100, w: 100, label: 'main', focused: true }],
        },
        {
          name: 'logs',
          panes: [{ id: 'p1', r: 0, c: 0, h: 100, w: 100, label: 'tail', focused: false }],
        },
      ],
      activeWindow: 0,
    },
    goal: {
      activeWindow: 1,
      windows: [
        {
          name: 'shell',
          panes: [{ id: 'p0', r: 0, c: 0, h: 100, w: 100, focused: false }],
        },
        {
          name: 'logs',
          panes: [{ id: 'p1', r: 0, c: 0, h: 100, w: 100, focused: true }],
        },
      ],
    },
    acceptedSolutions: [['prefix', 'n'], ['prefix', '1']],
    minSteps: 2,
    mobile: {
      type: 'sequence',
      steps: ['prefix', 'n'],
      keycaps: ['prefix', 'n', 'p', '1', 'c'],
      hint: 'Tap ⌃ b, then n to jump to the next window.',
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