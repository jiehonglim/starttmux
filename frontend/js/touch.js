import { applyTmuxKey } from './interpreter.js';
import { snapshot, snapshotsEqual } from './state.js';
import { goalSnapshot } from './puzzles.js';
import { recordWrongKey, markComplete, saveCompletedMobile } from './scoring.js';
import { renderSession, showWinOverlay, flashPane } from './renderer.js';
import { labelForKey } from './keycaps.js';

/** @param {object} opts */
export function attachTouchInput(opts) {
  const { root, game, puzzle, overlay, panel, onRetry } = opts;
  const mobile = puzzle.mobile;
  if (!mobile || mobile.type !== 'sequence') {
    throw new Error('Puzzle missing mobile sequence config');
  }

  let stepIndex = 0;

  function resetSequence() {
    stepIndex = 0;
    game.session.prefixPending = false;
    renderProgress();
    renderSession(root, game.session);
  }

  function renderProgress() {
    const strip = panel.querySelector('[data-sequence]');
    if (!strip) return;
    strip.innerHTML = mobile.steps
      .map((key, i) => {
        const done = i < stepIndex;
        const active = i === stepIndex;
        const cls = done ? 'seq-step--done' : active ? 'seq-step--active' : '';
        return `<span class="seq-step ${cls}">${labelForKey(key)}</span>`;
      })
      .join('<span class="seq-step__arrow">→</span>');
  }

  function renderKeycaps() {
    const row = panel.querySelector('[data-keycaps]');
    if (!row) return;
    row.innerHTML = '';
    for (const key of mobile.keycaps) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'keycap';
      btn.dataset.key = key;
      btn.textContent = labelForKey(key);
      btn.setAttribute('aria-label', `tmux ${labelForKey(key)}`);
      row.appendChild(btn);
    }
  }

  function checkWin() {
    const current = snapshot(game.session);
    const goal = goalSnapshot(puzzle);
    if (!snapshotsEqual(current, goal)) return false;

    markComplete(game.score);
    saveCompletedMobile(puzzle.id, {
      elapsedMs: game.score.elapsedMs,
      wrongKeys: game.score.wrongKeys,
    });
    showWinOverlay(overlay, puzzle, game.score, 'mobile');
    return true;
  }

  function onWrongTap() {
    recordWrongKey(game.score);
    root.classList.add('terminal--shake');
    window.setTimeout(() => root.classList.remove('terminal--shake'), 320);
    resetSequence();
    navigator.vibrate?.(12);
  }

  function onKeycapTap(key) {
    if (game.score.completed) return;

    const expected = mobile.steps[stepIndex];
    if (key !== expected) {
      onWrongTap();
      return;
    }

    navigator.vibrate?.(6);

    if (key === 'prefix') {
      game.session.prefixPending = true;
      stepIndex += 1;
      renderProgress();
      renderSession(root, game.session);
      return;
    }

    game.session.prefixPending = false;
    const { ok, action } = applyTmuxKey(game.session, key);
    stepIndex += 1;
    renderProgress();
    renderSession(root, game.session);

    if (!ok) {
      onWrongTap();
      return;
    }

    if (action === 'split-v' || action === 'split-h') {
      const focused = root.querySelector('.pane--focused');
      if (focused) flashPane(focused);
    }

    if (stepIndex >= mobile.steps.length) {
      resetSequence();
      checkWin();
    }
  }

  function onPanelClick(event) {
    const btn = /** @type {HTMLElement} */ (event.target).closest('[data-key]');
    if (!btn) return;
    onKeycapTap(btn.dataset.key);
  }

  function onOverlayClick(event) {
    if (/** @type {HTMLElement} */ (event.target).closest('[data-retry]')) {
      event.preventDefault();
      onRetry?.();
    }
  }

  panel.addEventListener('click', onPanelClick);
  overlay?.addEventListener('click', onOverlayClick);

  renderKeycaps();
  renderProgress();

  return {
    destroy() {
      panel.removeEventListener('click', onPanelClick);
      overlay?.removeEventListener('click', onOverlayClick);
    },
    resetSequence,
  };
}