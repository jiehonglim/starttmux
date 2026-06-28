export function createScoring() {
  return {
    startedAt: Date.now(),
    wrongKeys: 0,
    completed: false,
    elapsedMs: 0,
  };
}

/** @param {ReturnType<typeof createScoring>} score */
export function recordWrongKey(score) {
  if (!score.completed) score.wrongKeys += 1;
}

/** @param {ReturnType<typeof createScoring>} score */
export function markComplete(score) {
  score.completed = true;
  score.elapsedMs = Date.now() - score.startedAt;
}

/** @param {number} ms */
export function formatTime(ms) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `0:${String(s).padStart(2, '0')}`;
}

const STORAGE_KEY = 'starttmux_completed';
const STORAGE_KEY_MOBILE = 'starttmux_completed_mobile';

function loadFrom(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveTo(storageKey, levelId, result) {
  const all = loadFrom(storageKey);
  const prev = all[String(levelId)];
  if (!prev || result.elapsedMs < prev.elapsedMs) {
    all[String(levelId)] = result;
    localStorage.setItem(storageKey, JSON.stringify(all));
  }
}

export function loadCompleted() {
  return loadFrom(STORAGE_KEY);
}

export function loadCompletedMobile() {
  return loadFrom(STORAGE_KEY_MOBILE);
}

/** @param {number} levelId @param {{ elapsedMs: number, wrongKeys: number }} result */
export function saveCompleted(levelId, result) {
  saveTo(STORAGE_KEY, levelId, result);
}

/** @param {number} levelId @param {{ elapsedMs: number, wrongKeys: number }} result */
export function saveCompletedMobile(levelId, result) {
  saveTo(STORAGE_KEY_MOBILE, levelId, result);
}