import { useState, useEffect } from 'react';
import { THEMES } from '../constants.ts';
import { Theme } from '../types.ts';

/**
 * Custom hook for managing application theme (light/dark mode).
 * Syncs with the user's OS preference and allows manual toggling.
 */
export function useAppTheme() {
  const [theme, setTheme] = useState<Theme>(function getOsCurrentTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return THEMES.LIGHT;
    }
    return THEMES.DARK;
  });

  // Apply the current theme to the document body via data attribute
  // This allows CSS to style components based on [data-theme="light"] or [data-theme="dark"]
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // Listen for OS-level theme changes and update the app theme accordingly
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? THEMES.LIGHT : THEMES.DARK);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK));
  };

  return { theme, toggleTheme };
}
