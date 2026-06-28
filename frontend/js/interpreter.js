import {
  splitFocusedPane,
  moveFocus,
  newWindow,
  nextWindow,
  prevWindow,
  selectWindow,
  activeWindow,
} from './state.js';

const ARROW_MAP = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
};

/** @param {import('./state.js').Session} session @param {string} key */
export function applyTmuxKey(session, key) {
  const win = activeWindow(session);
  if (!win) return { ok: false, action: null };

  if (key === '%') {
    return { ok: splitFocusedPane(win, 'v'), action: 'split-v' };
  }
  if (key === '"') {
    return { ok: splitFocusedPane(win, 'h'), action: 'split-h' };
  }
  if (key in ARROW_MAP) {
    return { ok: moveFocus(win, ARROW_MAP[key]), action: 'focus' };
  }
  if (key === 'c') {
    return { ok: newWindow(session), action: 'new-window' };
  }
  if (key === 'n') {
    return { ok: nextWindow(session), action: 'next-window' };
  }
  if (key === 'p') {
    return { ok: prevWindow(session), action: 'prev-window' };
  }
  if (/^[0-9]$/.test(key)) {
    return { ok: selectWindow(session, Number(key)), action: 'select-window' };
  }

  return { ok: false, action: null };
}

/** @param {KeyboardEvent} event */
export function isPrefixChord(event) {
  return event.ctrlKey && !event.metaKey && !event.altKey
    && event.key.toLowerCase() === 'b';
}

const MODIFIER_KEYS = new Set([
  'Shift', 'Control', 'Alt', 'Meta', 'OS', 'CapsLock',
]);

/** Ignore lone modifier keydowns — Shift before Shift+5 must not cancel prefix. */
export function isModifierOnly(event) {
  return MODIFIER_KEYS.has(event.key);
}

/**
 * Map a post-prefix keydown to a tmux command token.
 * Uses event.code as fallback when event.key varies by keyboard layout.
 * @param {KeyboardEvent} event
 * @returns {string | null} null = ignore this keydown (modifier only)
 */
export function keyFromEvent(event) {
  if (isModifierOnly(event)) return null;

  if (event.key === '%' || (event.key === '5' && event.shiftKey)) return '%';
  if (event.code === 'Digit5' && event.shiftKey) return '%';

  if (event.key === '"' || (event.key === "'" && event.shiftKey)) return '"';
  if (event.code === 'Quote' && event.shiftKey) return '"';

  if (event.key.length === 1) return event.key;
  return event.key;
}

/** Replay a sequence of keys after prefix for tests. Keys are post-prefix tokens. */
export function replaySequence(session, keys) {
  const results = [];
  for (const key of keys) {
    if (key === 'C-b' || key === 'prefix') {
      session.prefixPending = true;
      results.push({ key, ok: true });
      continue;
    }
    if (!session.prefixPending) {
      results.push({ key, ok: false });
      continue;
    }
    session.prefixPending = false;
    const result = applyTmuxKey(session, key);
    results.push({ key, ...result });
  }
  return results;
}