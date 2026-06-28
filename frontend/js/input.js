import { applyTmuxKey, isPrefixChord, keyFromEvent } from './interpreter.js';
import { snapshot, snapshotsEqual } from './state.js';
import { goalSnapshot } from './puzzles.js';
import { recordWrongKey, markComplete, saveCompleted } from './scoring.js';
import { renderSession, showWinOverlay, flashPane } from './renderer.js';

const PREFIX_TIMEOUT_MS = 1000;

/** @param {object} opts */
export function attachInput(opts) {
  const {
    root,
    game,
    puzzle,
    overlay,
    onWin,
    onRetry,
  } = opts;

  let prefixTimer = null;

  function clearPrefixTimer() {
    if (prefixTimer) {
      clearTimeout(prefixTimer);
      prefixTimer = null;
    }
  }

  function armPrefixTimer() {
    clearPrefixTimer();
    prefixTimer = setTimeout(() => {
      game.session.prefixPending = false;
      renderSession(root, game.session);
    }, PREFIX_TIMEOUT_MS);
  }

  function checkWin() {
    const current = snapshot(game.session);
    const goal = goalSnapshot(puzzle);
    if (!snapshotsEqual(current, goal)) return false;

    markComplete(game.score);
    saveCompleted(puzzle.id, { elapsedMs: game.score.elapsedMs, wrongKeys: game.score.wrongKeys });
    showWinOverlay(overlay, puzzle, game.score);
    onWin?.();
    return true;
  }

  function handlePrefix() {
    game.session.prefixPending = true;
    armPrefixTimer();
    renderSession(root, game.session);
  }

  function handleCommand(key) {
    clearPrefixTimer();
    game.session.prefixPending = false;

    const before = snapshot(game.session);
    const { ok, action } = applyTmuxKey(game.session, key);

    if (!ok) {
      recordWrongKey(game.score);
      root.classList.add('terminal--shake');
      window.setTimeout(() => root.classList.remove('terminal--shake'), 320);
    } else if (action === 'split-v' || action === 'split-h') {
      const focused = root.querySelector('.pane--focused');
      if (focused) flashPane(focused);
    }

    renderSession(root, game.session);

    if (!ok) return;

    const after = snapshot(game.session);
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      checkWin();
    } else {
      checkWin();
    }
  }

  function onKeyDown(event) {
    if (game.score.completed) return;

    const tag = event.target?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;

    if (isPrefixChord(event)) {
      event.preventDefault();
      handlePrefix();
      return;
    }

    if (!game.session.prefixPending) {
      if (!event.ctrlKey && !event.metaKey && event.key.length === 1) {
        recordWrongKey(game.score);
        root.classList.add('terminal--shake');
        window.setTimeout(() => root.classList.remove('terminal--shake'), 320);
      }
      return;
    }

    const key = keyFromEvent(event);
    if (key === null) return;

    event.preventDefault();
    handleCommand(key);
  }

  overlay?.addEventListener('click', (event) => {
    const target = /** @type {HTMLElement} */ (event.target);
    if (target.closest('[data-retry]')) {
      event.preventDefault();
      onRetry?.();
    }
  });

  document.addEventListener('keydown', onKeyDown);

  return () => {
    document.removeEventListener('keydown', onKeyDown);
    clearPrefixTimer();
  };
}