/** @typedef {{ id?: string, r: number, c: number, h: number, w: number, label?: string, focused?: boolean }} PaneDef */
/** @typedef {{ name: string, panes: PaneDef[], zoomedPaneId?: string | null }} WindowDef */
/** @typedef {{ windows: WindowDef[], activeWindow?: number }} PuzzleStart */
/** @typedef {{ windows: WindowDef[], activeWindow: number }} PuzzleGoal */

/** @typedef {{
 *   id: number,
 *   track: 'golden' | 'levelup',
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
      zoomedPaneId: w.zoomedPaneId ?? null,
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
    track: 'golden',
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
    track: 'golden',
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
    track: 'golden',
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
    track: 'golden',
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
    track: 'golden',
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
  {
    id: 6,
    track: 'levelup',
    pathOrder: 1,
    pathTitle: 'Close finished pane',
    title: 'Close finished pane',
    bucket: 'Level up · step 1',
    hint: 'Kill a stale pane with prefix + x — the survivor expands to fill the window.',
    agentTip: 'Close agent panes when the job is done so your layout stays readable.',
    shortcut: '⌃ b x',
    estSeconds: 45,
    start: {
      windows: [{
        name: 'agent',
        panes: [
          { id: 'p0', r: 0, c: 0, h: 100, w: 50, label: 'agent', focused: true },
          { id: 'p1', r: 0, c: 50, h: 100, w: 50, label: 'shell', focused: false },
        ],
      }],
      activeWindow: 0,
    },
    goal: {
      activeWindow: 0,
      windows: [{
        name: 'agent',
        panes: [
          { id: 'p1', r: 0, c: 0, h: 100, w: 100, focused: true, label: 'shell' },
        ],
      }],
    },
    acceptedSolutions: [['prefix', 'x']],
    minSteps: 2,
    mobile: {
      type: 'sequence',
      steps: ['prefix', 'x'],
      keycaps: ['prefix', 'x', '%', '"'],
      hint: 'Tap ⌃ b, then x to close the focused agent pane.',
    },
  },
  {
    id: 7,
    track: 'levelup',
    pathOrder: 2,
    pathTitle: 'Zoom the transcript',
    title: 'Zoom the transcript',
    bucket: 'Level up · step 2',
    hint: 'Zoom the focused pane with prefix + z — fullscreen one stream while jobs run elsewhere.',
    agentTip: 'Zoom agent output when you need to read a long stack trace, then zoom out to check logs.',
    shortcut: '⌃ b z',
    estSeconds: 45,
    start: {
      windows: [{
        name: 'agent',
        panes: [
          { id: 'p0', r: 0, c: 0, h: 100, w: 50, label: 'agent', focused: true },
          { id: 'p1', r: 0, c: 50, h: 100, w: 50, label: 'logs', focused: false },
        ],
      }],
      activeWindow: 0,
    },
    goal: {
      activeWindow: 0,
      windows: [{
        name: 'agent',
        zoomedPaneId: 'p0',
        panes: [
          { id: 'p0', r: 0, c: 0, h: 100, w: 50, focused: true, label: 'agent' },
          { id: 'p1', r: 0, c: 50, h: 100, w: 50, focused: false, label: 'logs' },
        ],
      }],
    },
    acceptedSolutions: [['prefix', 'z']],
    minSteps: 2,
    mobile: {
      type: 'sequence',
      steps: ['prefix', 'z'],
      keycaps: ['prefix', 'z', 'ArrowLeft', 'ArrowRight'],
      hint: 'Tap ⌃ b, then z to zoom the agent pane.',
    },
  },
  {
    id: 8,
    track: 'levelup',
    pathOrder: 3,
    pathTitle: 'Previous window',
    title: 'Previous window',
    bucket: 'Level up · step 3',
    hint: 'Step back with prefix + p — the pair to next window from the golden path.',
    agentTip: 'Flip backward when you overshoot with n, or when you want the prior project window.',
    shortcut: '⌃ b p',
    estSeconds: 45,
    start: {
      windows: [
        {
          name: 'agent',
          panes: [{ id: 'p0', r: 0, c: 0, h: 100, w: 100, label: 'agent', focused: false }],
        },
        {
          name: 'win1',
          panes: [{ id: 'p1', r: 0, c: 0, h: 100, w: 100, label: 'agent2', focused: true }],
        },
      ],
      activeWindow: 1,
    },
    goal: {
      activeWindow: 0,
      windows: [
        {
          name: 'agent',
          panes: [{ id: 'p0', r: 0, c: 0, h: 100, w: 100, focused: true }],
        },
        {
          name: 'win1',
          panes: [{ id: 'p1', r: 0, c: 0, h: 100, w: 100, focused: false }],
        },
      ],
    },
    acceptedSolutions: [['prefix', 'p'], ['prefix', '0']],
    minSteps: 2,
    mobile: {
      type: 'sequence',
      steps: ['prefix', 'p'],
      keycaps: ['prefix', 'p', 'n', '0', '1'],
      hint: 'Tap ⌃ b, then p to return to the first agent window.',
    },
  },
  {
    id: 9,
    track: 'levelup',
    pathOrder: 4,
    pathTitle: 'Name your windows',
    title: 'Name your windows',
    bucket: 'Level up · step 4',
    hint: 'Rename the active window with prefix + , — labels stick in the status bar.',
    agentTip: 'Name windows agent, tests, and deploy so you never land in the wrong session.',
    shortcut: '⌃ b ,',
    estSeconds: 30,
    start: {
      windows: [{
        name: 'win0',
        panes: [{ id: 'p0', r: 0, c: 0, h: 100, w: 100, label: 'agent', focused: true }],
      }],
      activeWindow: 0,
    },
    goal: {
      activeWindow: 0,
      windows: [{
        name: 'agent',
        panes: [{ id: 'p0', r: 0, c: 0, h: 100, w: 100, focused: true }],
      }],
    },
    acceptedSolutions: [['prefix', ',']],
    minSteps: 2,
    mobile: {
      type: 'sequence',
      steps: ['prefix', ','],
      keycaps: ['prefix', ',', 'c', 'n'],
      hint: 'Tap ⌃ b, then , to rename this window to agent.',
    },
  },
  {
    id: 10,
    track: 'levelup',
    pathOrder: 5,
    pathTitle: 'Control room',
    title: 'Control room',
    bucket: 'Level up · step 5',
    hint: 'Build the agent control room: split horizontally for logs, focus up, split vertically for shell.',
    agentTip: 'This is the layout from the cheat sheet — agent, shell, and streaming logs in one window.',
    shortcut: '⌃ b " then ⌃ b %',
    estSeconds: 120,
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
          { id: 'p0', r: 0, c: 0, h: 50, w: 50, focused: false, label: 'agent' },
          { id: 'p1', r: 50, c: 0, h: 50, w: 100, focused: false, label: 'logs' },
          { id: 'p2', r: 0, c: 50, h: 50, w: 50, focused: true, label: 'shell' },
        ],
      }],
    },
    acceptedSolutions: [
      ['prefix', '"', 'prefix', 'ArrowUp', 'prefix', '%'],
    ],
    minSteps: 6,
    mobile: {
      type: 'sequence',
      steps: ['prefix', '"', 'prefix', 'ArrowUp', 'prefix', '%'],
      keycaps: ['prefix', '"', 'ArrowUp', 'ArrowDown', 'prefix', '%', 'ArrowLeft'],
      hint: 'Tap ⌃ b ", then ⌃ b ↑, then ⌃ b % to build the three-pane layout.',
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

/** @param {Puzzle[]} [puzzles] @param {'golden' | 'levelup'} [track] */
export function listPuzzlesByPath(puzzles = PUZZLES, track = 'golden') {
  return puzzles
    .filter((p) => p.track === track)
    .sort((a, b) => a.pathOrder - b.pathOrder);
}