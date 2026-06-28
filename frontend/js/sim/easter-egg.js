const COW = String.raw`
        ^__^
        (oo)\_______
        (__)\       )\/\
            ||----w |
            ||     ||
`;

export const EASTER_EGG_KEY = 'starttmux_easter_egg';

/** @param {string} line */
export function checkEasterEgg(line) {
  const normalized = line.trim().toLowerCase();
  return normalized === 'cow say tmux' || normalized === 'cowsay tmux';
}

export function easterEggLines() {
  return [
    COW.trim(),
    'The session abides. Detach with ⌃ b d anytime.',
  ];
}

export function unlockEasterEgg() {
  try {
    localStorage.setItem(EASTER_EGG_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function isEasterEggUnlocked() {
  try {
    return localStorage.getItem(EASTER_EGG_KEY) === '1';
  } catch {
    return false;
  }
}