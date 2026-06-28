import { activeWindow, getFocusedPane } from './state.js';
import { nextPlayableLevel } from './reference.js';
import { listPuzzles } from './puzzles.js?v=20260628b';

/** @param {HTMLElement} root @param {import('./state.js').Session} session */
export function renderSession(root, session) {
  const win = activeWindow(session);
  if (!win) return;

  const board = root.querySelector('[data-board]');
  const statusBar = root.querySelector('[data-status]');
  const prefixEl = root.querySelector('[data-prefix]');
  const windowsEl = root.querySelector('[data-windows]');

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
    el.className = 'pane' + (pane.focused ? ' pane--focused' : '');
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

    if (pane.focused) {
      const cursor = document.createElement('span');
      cursor.className = 'pane__cursor';
      cursor.textContent = '▌';
      el.appendChild(cursor);
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

  statusBar.dataset.session = `${session.activeWindow}:${win.panes.length}`;
}

/** @param {import('./puzzles.js').Puzzle} puzzle @param {'desktop'|'mobile'} [platform] */
export function winNavigation(puzzle, platform = 'desktop') {
  const next = nextPlayableLevel(listPuzzles(), puzzle.id);
  const mode = platform === 'mobile' ? 'mobile' : 'desktop';
  if (next) {
    return {
      next,
      nextHref: `play.html?level=${next.id}&mode=${mode}`,
      nextLabel: `Next: ${next.pathTitle}`,
    };
  }
  if (puzzle.track === 'levelup' && puzzle.pathOrder === 5) {
    return {
      next: null,
      nextHref: 'simulator.html',
      nextLabel: 'Open simulator',
    };
  }
  return {
    next: null,
    nextHref: 'index.html',
    nextLabel: puzzle.track === 'golden' ? 'Golden path complete' : 'Track complete',
  };
}

/** @param {HTMLElement} overlay @param {import('./puzzles.js').Puzzle} puzzle @param {object} score @param {'desktop'|'mobile'} [platform] */
export function showWinOverlay(overlay, puzzle, score, platform = 'desktop') {
  const { formatTime } = window.__starttmux ?? {};
  const time = formatTime ? formatTime(score.elapsedMs) : `${score.elapsedMs}ms`;
  const mistakeLabel = platform === 'mobile' ? 'Wrong taps' : 'Wrong keys';
  const modeTag = platform === 'mobile' ? '📱 Touch' : '⌨️ Desktop';
  const { nextHref, nextLabel } = winNavigation(puzzle, platform);
  const keyboardHint = platform === 'desktop'
    ? '<p class="win-card__keys mode-desktop-only"><kbd>Enter</kbd> continue · <kbd>R</kbd> retry</p>'
    : '';

  overlay.hidden = false;
  overlay.innerHTML = `
    <div class="win-card">
      <p class="win-card__tag">${modeTag} · ${puzzle.track === 'levelup' ? 'Level up' : 'Golden path'} step ${puzzle.pathOrder} complete</p>
      <h2 class="win-card__title">${puzzle.pathTitle}</h2>
      <dl class="win-card__stats">
        <div><dt>Time</dt><dd>${time}</dd></div>
        <div><dt>${mistakeLabel}</dt><dd>${score.wrongKeys}</dd></div>
      </dl>
      ${keyboardHint}
      <div class="win-card__actions">
        <button type="button" class="btn" data-retry>Retry</button>
        <a href="${nextHref}" class="btn">${nextLabel}</a>
        <a href="cheatsheet.html" class="btn btn--ghost">Cheat sheet</a>
        <a href="index.html" class="btn btn--ghost">All steps</a>
      </div>
    </div>
  `;
  overlay.classList.add('overlay--show');
}

export function hideWinOverlay(overlay) {
  overlay.hidden = true;
  overlay.classList.remove('overlay--show');
  overlay.innerHTML = '';
}

/** @param {HTMLElement} paneEl */
export function flashPane(paneEl) {
  paneEl.classList.add('pane--flash');
  window.setTimeout(() => paneEl.classList.remove('pane--flash'), 280);
}