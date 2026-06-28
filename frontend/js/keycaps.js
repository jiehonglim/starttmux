/** Display labels for on-screen tmux keycaps. */
export const KEYCAP_LABELS = {
  prefix: '⌃ b',
  '%': '%',
  '"': '"',
  c: 'c',
  n: 'n',
  p: 'p',
  '0': '0',
  '1': '1',
  ArrowLeft: '←',
  ArrowRight: '→',
  ArrowUp: '↑',
  ArrowDown: '↓',
  x: 'x',
  z: 'z',
  ',': ',',
};

/** @param {string} key */
export function labelForKey(key) {
  return KEYCAP_LABELS[key] ?? key;
}