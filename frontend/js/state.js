/** @typedef {{ id: string, r: number, c: number, h: number, w: number, label?: string }} Pane */
/** @typedef {{ name: string, panes: Pane[] }} Window */
/** @typedef {{ windows: Window[], activeWindow: number, prefixPending: boolean }} Session */

let paneCounter = 0;

export function resetPaneCounter(n = 0) {
  paneCounter = n;
}

function nextPaneId() {
  return `p${paneCounter++}`;
}

/** @param {import('./puzzles.js').PuzzleStart} start */
export function createSession(start) {
  resetPaneCounter(0);
  const windows = start.windows.map((w) => ({
    name: w.name,
    panes: w.panes.map((p) => ({
      id: p.id ?? nextPaneId(),
      r: p.r,
      c: p.c,
      h: p.h,
      w: p.w,
      label: p.label ?? '',
      focused: !!p.focused,
    })),
  }));

  let maxId = 0;
  for (const w of windows) {
    for (const p of w.panes) {
      const m = /^p(\d+)$/.exec(p.id);
      if (m) maxId = Math.max(maxId, Number(m[1]) + 1);
    }
  }
  resetPaneCounter(maxId);

  return {
    windows,
    activeWindow: start.activeWindow ?? 0,
    prefixPending: false,
  };
}

/** @param {Session} session */
export function cloneSession(session) {
  return JSON.parse(JSON.stringify(session));
}

/** @param {Window} win */
export function getFocusedPane(win) {
  return win.panes.find((p) => p.focused) ?? win.panes[0] ?? null;
}

/** @param {Window} win @param {string} paneId */
export function setFocus(win, paneId) {
  for (const p of win.panes) {
    p.focused = p.id === paneId;
  }
}

/** @param {Window} win @param {'v'|'h'} direction */
export function splitFocusedPane(win, direction) {
  const focused = getFocusedPane(win);
  if (!focused) return false;

  if (direction === 'v') {
    if (focused.w < 2) return false;
    const half = Math.floor(focused.w / 2);
    const remainder = focused.w - half;
    const newPane = {
      id: nextPaneId(),
      r: focused.r,
      c: focused.c + half,
      h: focused.h,
      w: remainder,
      label: 'pane',
    };
    focused.w = half;
    focused.label = focused.label || 'pane';
    newPane.focused = true;
    focused.focused = false;
    win.panes.push(newPane);
    return true;
  }

  if (focused.h < 2) return false;
  const half = Math.floor(focused.h / 2);
  const remainder = focused.h - half;
  const newPane = {
    id: nextPaneId(),
    r: focused.r + half,
    c: focused.c,
    h: remainder,
    w: focused.w,
    label: 'pane',
  };
  focused.h = half;
  newPane.focused = true;
  focused.focused = false;
  win.panes.push(newPane);
  return true;
}

/** @param {Pane} a @param {Pane} b */
function sharesHorizontalEdge(a, b) {
  const aBottom = a.r + a.h;
  const bBottom = b.r + b.h;
  const overlap = Math.min(aBottom, bBottom) - Math.max(a.r, b.r);
  return overlap > 0;
}

/** @param {Pane} a @param {Pane} b */
function sharesVerticalEdge(a, b) {
  const aRight = a.c + a.w;
  const bRight = b.c + b.w;
  const overlap = Math.min(aRight, bRight) - Math.max(a.c, b.c);
  return overlap > 0;
}

/** @param {Window} win @param {'left'|'right'|'up'|'down'} dir */
export function moveFocus(win, dir) {
  const current = getFocusedPane(win);
  if (!current) return false;

  let best = null;
  let bestDist = Infinity;

  for (const candidate of win.panes) {
    if (candidate.id === current.id) continue;

    const curCx = current.c + current.w / 2;
    const curCy = current.r + current.h / 2;
    const candCx = candidate.c + candidate.w / 2;
    const candCy = candidate.r + candidate.h / 2;

    let ok = false;
    let dist = 0;

    if (dir === 'left') {
      ok = candCx < curCx && sharesHorizontalEdge(current, candidate);
      dist = curCx - candCx;
    } else if (dir === 'right') {
      ok = candCx > curCx && sharesHorizontalEdge(current, candidate);
      dist = candCx - curCx;
    } else if (dir === 'up') {
      ok = candCy < curCy && sharesVerticalEdge(current, candidate);
      dist = curCy - candCy;
    } else if (dir === 'down') {
      ok = candCy > curCy && sharesVerticalEdge(current, candidate);
      dist = candCy - curCy;
    }

    if (ok && dist < bestDist) {
      bestDist = dist;
      best = candidate;
    }
  }

  if (!best) return false;
  setFocus(win, best.id);
  return true;
}

/** @param {Session} session */
export function newWindow(session) {
  const n = session.windows.length;
  const pane = {
    id: nextPaneId(),
    r: 0,
    c: 0,
    h: 100,
    w: 100,
    label: 'shell',
    focused: true,
  };
  session.windows.push({
    name: n === 0 ? 'shell' : `win${n}`,
    panes: [pane],
  });
  session.activeWindow = session.windows.length - 1;
  for (const w of session.windows) {
    if (session.windows.indexOf(w) !== session.activeWindow) {
      for (const p of w.panes) p.focused = false;
    }
  }
  return true;
}

/** Focus the active window's pane and clear focus elsewhere. */
function activateWindow(session, index) {
  session.activeWindow = index;
  session.windows.forEach((w, i) => {
    for (const p of w.panes) {
      p.focused = false;
    }
    if (i === index && w.panes[0]) {
      setFocus(w, w.panes[0].id);
    }
  });
}

/** @param {Session} session @param {number} delta */
function cycleWindow(session, delta) {
  if (session.windows.length < 2) return false;
  const n = session.windows.length;
  activateWindow(session, (session.activeWindow + delta + n) % n);
  return true;
}

/** @param {Session} session */
export function nextWindow(session) {
  return cycleWindow(session, 1);
}

/** @param {Session} session */
export function prevWindow(session) {
  return cycleWindow(session, -1);
}

/** @param {Session} session @param {number} index */
export function selectWindow(session, index) {
  if (index < 0 || index >= session.windows.length) return false;
  activateWindow(session, index);
  return true;
}

/** @param {Session} session */
export function activeWindow(session) {
  return session.windows[session.activeWindow];
}

/** @param {Session} session */
export function snapshot(session) {
  return {
    activeWindow: session.activeWindow,
    windows: session.windows.map((w) => ({
      name: w.name,
      panes: w.panes
        .map((p) => ({
          id: p.id,
          r: p.r,
          c: p.c,
          h: p.h,
          w: p.w,
          focused: !!p.focused,
        }))
        .sort((a, b) => a.id.localeCompare(b.id)),
    })),
  };
}

/** @param {object} a @param {object} b */
export function snapshotsEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}