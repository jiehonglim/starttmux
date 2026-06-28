import {
  PREFIX_NOTE,
  PANE_SHORTCUTS,
  WINDOW_SHORTCUTS,
  APPENDIX_COMMANDS,
  LAYOUT_ASCII,
  WORKFLOW_INTRO,
  goldenPathSteps,
} from './reference.js';
import { listPuzzles, listPuzzlesByPath } from './puzzles.js';
import { isMobileMode } from './device.js';

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** @param {string[]} keys */
function renderKeys(keys) {
  return keys.map((k) => `<kbd class="cheat-kbd">${escapeHtml(k)}</kbd>`).join('<span class="cheat-kbd-gap">+</span>');
}

/** @param {import('./reference.js').Shortcut[]} rows */
function renderShortcutTable(rows) {
  return `
    <table class="cheat-table">
      <thead>
        <tr><th>Keys</th><th>Action</th><th>Use when</th><th></th></tr>
      </thead>
      <tbody>
        ${rows.map((row) => `
          <tr>
            <td class="cheat-table__keys">${renderKeys(row.keys)}</td>
            <td>${escapeHtml(row.action)}</td>
            <td class="cheat-table__when">${escapeHtml(row.when)}</td>
            <td>${row.inGame ? '<span class="cheat-badge">in game</span>' : '<span class="cheat-badge cheat-badge--muted">reference</span>'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function boot() {
  const root = document.getElementById('cheat-root');
  if (!root) return;

  const mobile = isMobileMode();
  const mode = mobile ? 'mobile' : 'desktop';
  const steps = goldenPathSteps(listPuzzles());

  root.innerHTML = `
    <section class="cheat-hero">
      <p class="cheat-hero__eyebrow">Reference</p>
      <h1>Cheat sheet</h1>
      <p class="cheat-hero__lead">${escapeHtml(WORKFLOW_INTRO.body)}</p>
    </section>

    <section class="cheat-section">
      <h2>${escapeHtml(PREFIX_NOTE.title)}</h2>
      <p class="cheat-prefix">${renderKeys(PREFIX_NOTE.keys.split(' '))}</p>
      <p>${escapeHtml(PREFIX_NOTE.body)}</p>
      <p class="cheat-muted">${escapeHtml(PREFIX_NOTE.agentLine)}</p>
    </section>

    <section class="cheat-section">
      <h2>Golden path</h2>
      <p class="cheat-muted">Five puzzles in the order AI coders actually adopt tmux. Level IDs stay stable — follow the path, not the number.</p>
      <ol class="cheat-path">
        ${steps.map((step) => `
          <li class="cheat-path__step">
            <div class="cheat-path__head">
              <span class="cheat-path__num">${step.pathOrder}</span>
              <div>
                <h3>${escapeHtml(step.pathTitle)}</h3>
                <p class="cheat-path__keys">${escapeHtml(step.shortcut)}</p>
              </div>
            </div>
            <p>${escapeHtml(step.agentTip)}</p>
            <a href="play.html?level=${step.levelId}&mode=${mode}" class="btn cheat-path__play">Play step ${step.pathOrder}</a>
          </li>
        `).join('')}
      </ol>
    </section>

    <section class="cheat-section">
      <h2>Pane shortcuts</h2>
      ${renderShortcutTable(PANE_SHORTCUTS)}
    </section>

    <section class="cheat-section">
      <h2>Window shortcuts</h2>
      ${renderShortcutTable(WINDOW_SHORTCUTS)}
    </section>

    <section class="cheat-section">
      <h2>${escapeHtml(WORKFLOW_INTRO.title)}</h2>
      <pre class="cheat-layout" aria-label="Recommended tmux layout">${escapeHtml(LAYOUT_ASCII)}</pre>
    </section>

    <section class="cheat-section cheat-section--appendix">
      <h2>Next in real tmux</h2>
      <p class="cheat-muted">Not in the simulator yet — learn these after the golden path.</p>
      <ul class="cheat-appendix">
        ${APPENDIX_COMMANDS.map((cmd) => `
          <li>
            <span class="cheat-kbd">${escapeHtml(cmd.label)}</span>
            <strong>${escapeHtml(cmd.action)}</strong>
            <span class="cheat-muted">— ${escapeHtml(cmd.when)}</span>
          </li>
        `).join('')}
      </ul>
    </section>

    <footer class="site-footer">
      <a href="index.html" class="btn btn--ghost">← Golden path</a>
      <a href="play.html?level=${listPuzzlesByPath()[0].id}&mode=${mode}" class="btn">Start step 1</a>
    </footer>
  `;
}

boot();