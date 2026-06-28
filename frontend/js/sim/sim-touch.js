import { applyTmuxKey } from '../interpreter.js';
import { renderSimSession } from './sim-renderer.js';
import { runShellLine } from './shell.js';
import { flashPane } from '../renderer.js';
import { labelForKey } from '../keycaps.js';

const TMUX_KEYS = ['prefix', '%', '"', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'c', 'n', 'p', 'x', 'z'];

const SCRIPT_CHIPS = [
  { label: 'Grok Build', cmd: 'grok-build' },
  { label: 'Hermes', cmd: 'hermes' },
  { label: 'Claude Code', cmd: 'claude-code' },
  { label: 'npm test', cmd: 'npm test' },
  { label: 'Tail logs', cmd: 'tail -f logs/deploy.log' },
  { label: 'Deploy', cmd: './scripts/deploy.sh' },
  { label: 'ls', cmd: 'ls' },
  { label: 'cd src', cmd: 'cd src' },
  { label: 'cat package.json', cmd: 'cat package.json' },
];

/** @param {object} opts */
export function attachSimTouch(opts) {
  const { root, session, panel, dock, onEasterEgg, onTripleAgent } = opts;

  function render() {
    renderSimSession(root, session);
  }

  function runInFocused(cmd) {
    const win = session.windows[session.activeWindow];
    const pane = win?.panes.find((p) => p.focused) ?? win?.panes[0];
    if (!pane) return;
    runShellLine(pane, cmd);
    render();
    onTripleAgent?.();
  }

  function renderKeycaps() {
    const row = panel.querySelector('[data-keycaps]');
    if (!row) return;
    row.innerHTML = '';
    for (const key of TMUX_KEYS) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'keycap';
      btn.dataset.tmuxKey = key;
      btn.textContent = labelForKey(key);
      row.appendChild(btn);
    }
  }

  function renderDock() {
    if (!dock) return;
    dock.innerHTML = '';
    for (const chip of SCRIPT_CHIPS) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'script-chip';
      btn.dataset.cmd = chip.cmd;
      btn.textContent = chip.label;
      dock.appendChild(btn);
    }
  }

  function onTmuxTap(key) {
    if (key === 'prefix') {
      session.prefixPending = true;
      render();
      return;
    }
    session.prefixPending = false;
    const { ok, action } = applyTmuxKey(session, key);
    render();
    if (ok && (action === 'split-v' || action === 'split-h')) {
      const focused = root.querySelector('.pane--focused');
      if (focused) flashPane(focused);
    }
    onTripleAgent?.();
  }

  function onPanelClick(event) {
    const tmuxBtn = /** @type {HTMLElement} */ (event.target).closest('[data-tmux-key]');
    if (tmuxBtn?.dataset.tmuxKey) {
      onTmuxTap(tmuxBtn.dataset.tmuxKey);
      return;
    }
    const scriptBtn = /** @type {HTMLElement} */ (event.target).closest('[data-cmd]');
    if (scriptBtn?.dataset.cmd) {
      runInFocused(scriptBtn.dataset.cmd);
    }
  }

  panel?.addEventListener('click', onPanelClick);
  dock?.addEventListener('click', onPanelClick);

  renderKeycaps();
  renderDock();
  render();

  return {
    destroy() {
      panel?.removeEventListener('click', onPanelClick);
      dock?.removeEventListener('click', onPanelClick);
    },
    render,
  };
}