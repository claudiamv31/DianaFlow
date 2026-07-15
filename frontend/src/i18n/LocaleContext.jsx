import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from './instance';
import {
  DEFAULT_LOCALE,
  getLocaleDefinition,
  isSupportedLocale,
  LOCALE_STORAGE_KEY,
  matchSupportedLocale
} from './locales';

const getInitialLocale = () => {
  const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (isSupportedLocale(storedLocale)) return storedLocale;

  return matchSupportedLocale(window.navigator.languages || [window.navigator.language]);
};

const LocaleContext = createContext({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: i18n.t.bind(i18n),
  formatDate: (value, options) =>
    new Intl.DateTimeFormat(DEFAULT_LOCALE, options).format(value),
  formatNumber: (value, options) =>
    new Intl.NumberFormat(DEFAULT_LOCALE, options).format(value)
});

export const LocaleProvider = ({ children }) => {
  const [locale, setLocaleState] = useState(getInitialLocale);
  const { t } = useTranslation();

  useEffect(() => {
    i18n.changeLanguage(locale);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = getLocaleDefinition(locale).direction;
  }, [locale]);

  const setLocale = useCallback((nextLocale) => {
    if (isSupportedLocale(nextLocale)) setLocaleState(nextLocale);
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      formatDate: (date, options) =>
        new Intl.DateTimeFormat(locale, options).format(date),
      formatNumber: (number, options) =>
        new Intl.NumberFormat(locale, options).format(number)
    }),
    [locale, setLocale, t]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = () => useContext(LocaleContext);
