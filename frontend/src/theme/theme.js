export const THEME_STORAGE_KEY = 'dianaflow.theme';

export const THEME_PREFERENCES = Object.freeze({
  SYSTEM: 'system',
  LIGHT: 'light',
  DARK: 'dark'
});

export const isThemePreference = (value) =>
  Object.values(THEME_PREFERENCES).includes(value);

export const getSystemTheme = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return THEME_PREFERENCES.LIGHT;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? THEME_PREFERENCES.DARK
    : THEME_PREFERENCES.LIGHT;
};

export const resolveTheme = (preference) =>
  preference === THEME_PREFERENCES.SYSTEM ? getSystemTheme() : preference;

export const applyTheme = (preference) => {
  const resolvedTheme = resolveTheme(preference);
  const root = document.documentElement;

  root.dataset.theme = resolvedTheme;
  root.dataset.themePreference = preference;
  root.style.colorScheme = resolvedTheme;

  const themeColor = document.querySelector('meta[name="theme-color"]');
  themeColor?.setAttribute(
    'content',
    resolvedTheme === THEME_PREFERENCES.DARK ? '#121416' : '#fdf8f5'
  );

  return resolvedTheme;
};
