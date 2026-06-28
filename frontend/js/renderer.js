import { activeWindow, getFocusedPane } from './state.js';
import { nextPathLevel } from './reference.js';
import { listPuzzles } from './puzzles.js';

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

  for (const pane of win.panes) {
    const el = document.createElement('div');
    el.className = 'pane' + (pane.focused ? ' pane--focused' : '');
    el.dataset.paneId = pane.id;
    el.style.gridColumn = `${pane.c + 1} / span ${pane.w}`;
    el.style.gridRow = `${pane.r + 1} / span ${pane.h}`;

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

/** @param {HTMLElement} overlay @param {import('./puzzles.js').Puzzle} puzzle @param {object} score @param {'desktop'|'mobile'} [platform] */
export function showWinOverlay(overlay, puzzle, score, platform = 'desktop') {
  const { formatTime } = window.__starttmux ?? {};
  const time = formatTime ? formatTime(score.elapsedMs) : `${score.elapsedMs}ms`;
  const mistakeLabel = platform === 'mobile' ? 'Wrong taps' : 'Wrong keys';
  const modeTag = platform === 'mobile' ? '📱 Touch' : '⌨️ Desktop';
  const next = nextPathLevel(listPuzzles(), puzzle.id);
  const mode = platform === 'mobile' ? 'mobile' : 'desktop';
  const nextAction = next
    ? `<a href="play.html?level=${next.id}&mode=${mode}" class="btn">Next: ${next.pathTitle}</a>`
    : `<a href="index.html" class="btn">Golden path complete</a>`;

  overlay.hidden = false;
  overlay.innerHTML = `
    <div class="win-card">
      <p class="win-card__tag">${modeTag} · Step ${puzzle.pathOrder} complete</p>
      <h2 class="win-card__title">${puzzle.pathTitle}</h2>
      <dl class="win-card__stats">
        <div><dt>Time</dt><dd>${time}</dd></div>
        <div><dt>${mistakeLabel}</dt><dd>${score.wrongKeys}</dd></div>
      </dl>
      <div class="win-card__actions">
        <button type="button" class="btn" data-retry>Retry</button>
        ${nextAction}
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