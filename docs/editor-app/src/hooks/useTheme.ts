import { useEffect } from 'react';
import { useUIStore } from '../stores/uiStore';

/**
 * Hook to detect and apply the current theme.
 * Respects system preference when theme is set to 'auto'.
 * Sets the data-color-mode attribute on <html> for CSS.
 */
export function useTheme() {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    if (theme !== 'auto') {
      document.documentElement.setAttribute('data-color-mode', theme);
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = (e: MediaQueryListEvent | MediaQueryList) => {
      const resolved = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-color-mode', resolved);
    };

    applyTheme(mediaQuery);
    mediaQuery.addEventListener('change', applyTheme);

    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [theme]);
}
