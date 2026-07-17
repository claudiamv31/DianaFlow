import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import {
  applyTheme,
  isThemePreference,
  THEME_PREFERENCES,
  THEME_STORAGE_KEY
} from './theme';

const getInitialPreference = () => {
  try {
    const storedPreference = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(storedPreference)
      ? storedPreference
      : THEME_PREFERENCES.SYSTEM;
  } catch {
    return THEME_PREFERENCES.SYSTEM;
  }
};

const ThemeContext = createContext({
  themePreference: THEME_PREFERENCES.SYSTEM,
  resolvedTheme: THEME_PREFERENCES.LIGHT,
  setThemePreference: () => {}
});

export const ThemeProvider = ({ children }) => {
  const [themePreference, setThemePreferenceState] = useState(
    getInitialPreference
  );
  const [resolvedTheme, setResolvedTheme] = useState(() =>
    applyTheme(getInitialPreference())
  );

  const setThemePreference = useCallback((nextPreference) => {
    if (isThemePreference(nextPreference)) {
      setThemePreferenceState(nextPreference);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, themePreference);
    } catch {
      // The preference still works for this session when storage is unavailable.
    }
    setResolvedTheme(applyTheme(themePreference));

    if (
      themePreference !== THEME_PREFERENCES.SYSTEM ||
      typeof window.matchMedia !== 'function'
    ) {
      return undefined;
    }

    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      setResolvedTheme(applyTheme(THEME_PREFERENCES.SYSTEM));
    };

    colorSchemeQuery.addEventListener?.('change', handleSystemThemeChange);
    return () =>
      colorSchemeQuery.removeEventListener?.('change', handleSystemThemeChange);
  }, [themePreference]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (
        event.key === THEME_STORAGE_KEY &&
        isThemePreference(event.newValue)
      ) {
        setThemePreferenceState(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const value = useMemo(
    () => ({
      themePreference,
      resolvedTheme,
      setThemePreference
    }),
    [resolvedTheme, setThemePreference, themePreference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
