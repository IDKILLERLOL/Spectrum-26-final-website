export type Theme = 'light' | 'dark';

export function getTheme(): Theme {
  // Check localStorage, default to dark
  const stored = localStorage.getItem('spectrum26_theme');
  if (stored === 'light' || stored === 'dark') return stored;
  
  const htmlAttr = document.documentElement.getAttribute('data-theme');
  if (htmlAttr === 'light' || htmlAttr === 'dark') return htmlAttr;
  
  return 'dark';
}

export function applyTheme(theme: Theme) {
  const html = document.documentElement;
  html.setAttribute('data-theme', theme);
  if (theme === 'dark') {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
  localStorage.setItem('spectrum26_theme', theme);
}

export function toggleTheme(currentTheme: Theme, callback?: (next: Theme) => void) {
  const next = currentTheme === 'dark' ? 'light' : 'dark';
  
  const apply = () => {
    applyTheme(next);
    if (callback) callback(next);
  };

  if (!document.startViewTransition) {
    apply();
    return;
  }

  document.startViewTransition(apply);
}
