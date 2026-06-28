export const REPO_URL = 'https://github.com/jiehonglim/starttmux';
export const LICENSE_URL = `${REPO_URL}/blob/main/LICENSE`;
export const GROK_BUILD_URL = 'https://grok.com/build';
export const TMUX_URL = 'https://tmux.github.io/';

/** @type {{ id: string, href: string, label: string }[]} */
export const SITE_NAV = [
  { id: 'learn', href: 'index.html', label: 'Learn' },
  { id: 'cheatsheet', href: 'cheatsheet.html', label: 'Cheat sheet' },
  { id: 'simulator', href: 'simulator.html', label: 'Simulator' },
];

const YEAR = new Date().getFullYear();

export function initTheme() {
  const saved = localStorage.getItem('starttmux_theme');
  if (saved) document.documentElement.dataset.theme = saved;

  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const html = document.documentElement;
    const next = html.dataset.theme === 'light' ? 'dark' : 'light';
    html.dataset.theme = next;
    localStorage.setItem('starttmux_theme', next);
  });
}

function isNavActive(item) {
  const page = document.body.dataset.page ?? '';
  if (page === item.id) return true;
  if (item.id === 'learn' && page === 'play') return true;
  return false;
}

export function renderNav() {
  const nav = document.querySelector('[data-site-nav]');
  if (!nav) return;

  nav.innerHTML = SITE_NAV.map((item) => {
    const active = isNavActive(item);
    const cls = active ? ' site-header__link--active' : '';
    return `<a href="${item.href}" class="site-header__link${cls}">${item.label}</a>`;
  }).join('');
}

export function renderFooter() {
  const footer = document.querySelector('[data-site-footer]');
  if (!footer) return;

  const extra = document.getElementById('footer-extra');
  const actionsHtml = extra
    ? `<div class="site-footer__actions">${extra.innerHTML}</div>`
    : '';

  footer.innerHTML = `
    ${actionsHtml}
    <div class="site-footer__inner">
      <nav class="site-footer__links" aria-label="Site links">
        <a href="about.html">About</a>
        <a href="${REPO_URL}">GitHub</a>
        <a href="${LICENSE_URL}">MIT License</a>
      </nav>
      <p class="site-footer__legal">
        © ${YEAR} starttmux. Grok, Claude Code, and related names are trademarks of their
        respective owners. This educational simulator is not affiliated with or endorsed by
        xAI, Anthropic, or any agent product vendor. Simulated commands and output are fictional.
      </p>
      <p class="site-footer__credit">
        Built with <a href="${GROK_BUILD_URL}">Grok Build</a>
        <span class="site-footer__heart" aria-hidden="true">♥</span>
        · Inspired by <a href="${TMUX_URL}">tmux</a>
      </p>
    </div>
  `;
}

export function initSite() {
  initTheme();
  renderNav();
  renderFooter();
}

initSite();