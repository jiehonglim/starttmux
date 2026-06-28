import { createSession } from './state.js';
import { getPuzzle } from './puzzles.js';
import { createScoring, formatTime } from './scoring.js';
import { renderSession, hideWinOverlay } from './renderer.js';
import { attachInput } from './input.js';
import { attachTouchInput } from './touch.js';
import { isMobileMode } from './device.js';

window.__starttmux = { formatTime };

function levelFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const n = Number(params.get('level'));
  return Number.isFinite(n) ? n : 0;
}

function boot() {
  const levelId = levelFromQuery();
  const puzzle = getPuzzle(levelId);
  const root = document.querySelector('[data-terminal]');
  const overlay = document.querySelector('[data-overlay]');
  const touchPanel = document.querySelector('[data-touch-panel]');
  const titleEl = document.querySelector('[data-title]');
  const hintEl = document.querySelector('[data-hint]');
  const mobile = isMobileMode();

  if (!puzzle || !root || !overlay) {
    window.location.href = 'index.html';
    return;
  }

  document.body.classList.add(mobile ? 'mode-mobile' : 'mode-desktop');

  if (titleEl) titleEl.textContent = puzzle.title;
  if (hintEl) {
    hintEl.textContent = mobile && puzzle.mobile?.hint
      ? puzzle.mobile.hint
      : puzzle.hint;
  }

  const game = {
    session: createSession(puzzle.start),
    score: createScoring(),
  };

  let detachInput = null;
  let touchApi = null;

  function render() {
    renderSession(root, game.session);
  }

  function reset() {
    game.session = createSession(puzzle.start);
    game.score = createScoring();
    hideWinOverlay(overlay);
    touchApi?.resetSequence();
    render();
    if (!mobile) root.focus();
  }

  if (mobile) {
    if (!touchPanel || !puzzle.mobile) {
      window.location.href = `play.html?level=${levelId}&mode=desktop`;
      return;
    }
    touchPanel.hidden = false;
    touchApi = attachTouchInput({
      root,
      game,
      puzzle,
      overlay,
      panel: touchPanel,
      onRetry: reset,
    });
  } else {
    if (touchPanel) touchPanel.hidden = true;
    detachInput = attachInput({
      root,
      game,
      puzzle,
      overlay,
      onRetry: reset,
    });
    root.focus();
  }

  render();

  window.addEventListener('beforeunload', () => {
    detachInput?.();
    touchApi?.destroy();
  });
}

boot();