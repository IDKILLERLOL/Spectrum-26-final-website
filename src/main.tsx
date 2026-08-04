import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// ─── Multi-tab admin session lifecycle tracking ──────────────────────────────
const TABS_COUNT_KEY = 'spectrum26_open_tabs_count';
const LAST_CLOSED_KEY = 'spectrum26_all_tabs_closed_at';
const ADMIN_SESSION_KEY = 'spectrum26_admin_session';

const isReload = sessionStorage.getItem('spectrum26_tab_active') === 'true' ||
  performance.navigation.type === 1 || 
  performance.getEntriesByType('navigation')
    .map((nav) => (nav as PerformanceNavigationTiming).type)
    .includes('reload');

if (isReload) {
  localStorage.removeItem(ADMIN_SESSION_KEY);
} else {
  const lastClosedStr = localStorage.getItem(LAST_CLOSED_KEY);
  if (lastClosedStr) {
    const lastClosed = parseInt(lastClosedStr, 10);
    if (Date.now() - lastClosed > 500) {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    }
    localStorage.removeItem(LAST_CLOSED_KEY);
  }
}

sessionStorage.setItem('spectrum26_tab_active', 'true');

let tabsCount = parseInt(localStorage.getItem(TABS_COUNT_KEY) ?? '0', 10);
if (tabsCount < 0) tabsCount = 0;
localStorage.setItem(TABS_COUNT_KEY, (tabsCount + 1).toString());

window.addEventListener('beforeunload', () => {
  let count = parseInt(localStorage.getItem(TABS_COUNT_KEY) ?? '1', 10);
  count = Math.max(0, count - 1);
  localStorage.setItem(TABS_COUNT_KEY, count.toString());
  if (count === 0) {
    localStorage.setItem(LAST_CLOSED_KEY, Date.now().toString());
  }
});

// ─── Theme initialisation ─────────────────────────────────────────────────────
// Always default to dark. Only switch to light if the user previously chose it.
// Never use prefers-color-scheme (spec §10 constraint).
const storedTheme = localStorage.getItem('spectrum26_theme');
const theme = storedTheme === 'light' ? 'light' : 'dark';
document.documentElement.setAttribute('data-theme', theme);
if (theme === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}
const favicon = document.querySelector('link[rel="icon"]');
if (favicon) {
  favicon.setAttribute('href', theme === 'dark' ? '/white.ico' : '/black.ico');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
