import { activeWindow, getFocusedPane } from '../state.js';
import { countRunningAgents } from './processes.js';

/** @param {HTMLElement} root @param {import('./sim-session.js').SimSession} session @param {{ tripleAgent?: boolean }} [flags] */
export function renderSimSession(root, session, flags = {}) {
  const win = activeWindow(session);
  if (!win) return;

  const board = root.querySelector('[data-board]');
  const statusBar = root.querySelector('[data-status]');
  const prefixEl = root.querySelector('[data-prefix]');
  const windowsEl = root.querySelector('[data-windows]');
  const flairEl = root.querySelector('[data-flair]');

  if (!board || !statusBar) return;

  board.innerHTML = '';
  board.style.display = 'grid';
  board.style.gridTemplateColumns = 'repeat(100, 1fr)';
  board.style.gridTemplateRows = 'repeat(100, 1fr)';

  const panesToRender = win.zoomedPaneId
    ? win.panes.filter((p) => p.id === win.zoomedPaneId)
    : win.panes;

  for (const pane of panesToRender) {
    const el = document.createElement('div');
    el.className = 'pane pane--sim' + (pane.focused ? ' pane--focused' : '');
    if (win.zoomedPaneId) el.classList.add('pane--zoomed');
    el.dataset.paneId = pane.id;

    const col = win.zoomedPaneId ? 1 : pane.c + 1;
    const row = win.zoomedPaneId ? 1 : pane.r + 1;
    const colSpan = win.zoomedPaneId ? 100 : pane.w;
    const rowSpan = win.zoomedPaneId ? 100 : pane.h;
    el.style.gridColumn = `${col} / span ${colSpan}`;
    el.style.gridRow = `${row} / span ${rowSpan}`;

    const label = document.createElement('span');
    label.className = 'pane__label';
    label.textContent = pane.label || pane.id;
    el.appendChild(label);

    const screen = document.createElement('pre');
    screen.className = 'pane__screen';
    const lines = pane.shell.lines.slice(-12);
    const prompt = pane.shell.cwd.replace(/^\/home\/you/, '~');
    const inputLine = pane.focused
      ? `${prompt} $ ${pane.shell.input}▌`
      : '';
    screen.textContent = [...lines, inputLine].filter(Boolean).join('\n');
    el.appendChild(screen);

    if (pane.shell.process) {
      const badge = document.createElement('span');
      badge.className = 'pane__proc';
      badge.textContent = '●';
      el.appendChild(badge);
    }

    board.appendChild(el);
  }

  if (prefixEl) {
    prefixEl.textContent = session.prefixPending ? 'PREFIX' : '';
    prefixEl.classList.toggle('status__prefix--active', session.prefixPending);
  }

  if (windowsEl) {
    windowsEl.innerHTML = '';
    session.windows.forEach((w, i) => {
      const tab = document.createElement('span');
      tab.className = 'status__window' + (i === session.activeWindow ? ' status__window--active' : '');
      tab.textContent = `${i}:${w.name}`;
      windowsEl.appendChild(tab);
    });
  }

  const focused = getFocusedPane(win);
  const procLabel = focused?.shell.process
    ? ` · ${focused.shell.process.kind} running`
    : '';
  statusBar.dataset.session = `${session.activeWindow}:${win.panes.length}${procLabel}`;

  if (flairEl) {
    const agents = countRunningAgents(session);
    flairEl.hidden = !(flags.tripleAgent && agents.size >= 3);
    flairEl.textContent = 'triple agent mode';
  }
}