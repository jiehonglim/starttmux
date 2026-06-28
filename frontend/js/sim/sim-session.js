import { createSession } from '../state.js';
import { DEFAULT_CWD } from './vfs.js';

/** @typedef {{
 *   cwd: string,
 *   lines: string[],
 *   input: string,
 *   process: import('./processes.js').SimProcess | null,
 * }} ShellState */

/** @typedef {import('../state.js').Pane & { shell: ShellState }} SimPane */

/** @typedef {import('../state.js').Session & { windows: (import('../state.js').Window & { panes: SimPane[] })[] }} SimSession */

/** @param {boolean} [fresh] */
export function createPaneShell(fresh = false) {
  return {
    cwd: DEFAULT_CWD,
    lines: fresh
      ? ['New pane — type help or spawn an agent']
      : [
          'Welcome to the starttmux simulator.',
          'Try: help · grok · npm test · tail -f logs/deploy.log',
        ],
    input: '',
    process: null,
  };
}

/** @param {import('../state.js').Pane} pane */
export function ensurePaneShell(pane) {
  if (!pane.shell) {
    pane.shell = createPaneShell(true);
  }
  return /** @type {SimPane} */ (pane);
}

/** @param {SimSession} session */
export function ensureSessionShells(session) {
  for (const win of session.windows) {
    for (const pane of win.panes) {
      ensurePaneShell(pane);
    }
  }
}

/** @returns {SimSession} */
export function createSimSession() {
  const session = /** @type {SimSession} */ (createSession({
    activeWindow: 0,
    windows: [{
      name: 'sim',
      panes: [{
        id: 'p0',
        r: 0,
        c: 0,
        h: 100,
        w: 100,
        label: 'shell',
        focused: true,
      }],
    }],
  }));

  for (const win of session.windows) {
    for (const pane of win.panes) {
      pane.shell = createPaneShell();
    }
  }
  return session;
}

/** @param {SimPane} pane @param {string} line */
export function appendEcho(pane, line) {
  const prompt = pane.shell.cwd.replace(/^\/home\/you/, '~');
  pane.shell.lines.push(`${prompt} $ ${line}`);
  if (pane.shell.lines.length > 200) pane.shell.lines.shift();
}