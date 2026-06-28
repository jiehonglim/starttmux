import { applyTmuxKey, isPrefixChord, keyFromEvent } from '../interpreter.js';
import { runShellLine } from './shell.js';
import { killProcess } from './processes.js';
import { renderSimSession } from './sim-renderer.js';
import { flashPane } from '../renderer.js';

const PREFIX_TIMEOUT_MS = 1000;

/** @param {object} opts */
export function attachSimInput(opts) {
  const { root, session, onEasterEgg, onTripleAgent } = opts;
  let prefixTimer = null;
  let tripleShown = false;

  function clearPrefixTimer() {
    if (prefixTimer) {
      clearTimeout(prefixTimer);
      prefixTimer = null;
    }
  }

  function armPrefixTimer() {
    clearPrefixTimer();
    prefixTimer = setTimeout(() => {
      session.prefixPending = false;
      render();
    }, PREFIX_TIMEOUT_MS);
  }

  function getFocusedPane() {
    const win = session.windows[session.activeWindow];
    return win?.panes.find((p) => p.focused) ?? win?.panes[0] ?? null;
  }

  function render() {
    renderSimSession(root, session, { tripleAgent: tripleShown });
  }

  function handlePrefix() {
    session.prefixPending = true;
    armPrefixTimer();
    render();
  }

  function handleTmuxCommand(key) {
    clearPrefixTimer();
    session.prefixPending = false;
    const { ok, action } = applyTmuxKey(session, key);
    render();
    if (ok && (action === 'split-v' || action === 'split-h')) {
      const focused = root.querySelector('.pane--focused');
      if (focused) flashPane(focused);
    }
    onTripleAgent?.();
  }

  function handleShellChar(char) {
    const pane = getFocusedPane();
    if (!pane) return;
    pane.shell.input += char;
    render();
  }

  function handleBackspace() {
    const pane = getFocusedPane();
    if (!pane || !pane.shell.input) return;
    pane.shell.input = pane.shell.input.slice(0, -1);
    render();
  }

  function handleEnter() {
    const pane = getFocusedPane();
    if (!pane) return;
    const line = pane.shell.input;
    pane.shell.input = '';
    const { easterEgg } = runShellLine(pane, line);
    render();
    if (easterEgg) onEasterEgg?.();
    onTripleAgent?.();
  }

  function onKeyDown(event) {
    const tag = event.target?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;

    if (event.ctrlKey && event.key.toLowerCase() === 'c') {
      const pane = getFocusedPane();
      if (pane?.shell.process) {
        event.preventDefault();
        killProcess(pane);
        render();
      }
      return;
    }

    if (isPrefixChord(event)) {
      event.preventDefault();
      handlePrefix();
      return;
    }

    if (session.prefixPending) {
      const key = keyFromEvent(event);
      if (key === null) return;
      event.preventDefault();
      handleTmuxCommand(key);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      handleEnter();
      return;
    }

    if (event.key === 'Backspace') {
      event.preventDefault();
      handleBackspace();
      return;
    }

    if (!event.ctrlKey && !event.metaKey && !event.altKey && event.key.length === 1) {
      event.preventDefault();
      handleShellChar(event.key);
    }
  }

  document.addEventListener('keydown', onKeyDown);
  root.focus();

  return {
    render,
    destroy() {
      document.removeEventListener('keydown', onKeyDown);
      clearPrefixTimer();
    },
    setTripleShown(value) {
      tripleShown = value;
    },
  };
}