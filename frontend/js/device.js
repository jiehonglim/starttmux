/** @returns {'mobile' | 'desktop'} */
export function playMode() {
  const params = new URLSearchParams(window.location.search);
  const forced = params.get('mode');
  if (forced === 'mobile') return 'mobile';
  if (forced === 'desktop') return 'desktop';
  if (window.matchMedia('(pointer: coarse)').matches) return 'mobile';
  return 'desktop';
}

export function isMobileMode() {
  return playMode() === 'mobile';
}