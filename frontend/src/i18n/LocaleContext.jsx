import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { translations } from './translations';
import {
  DEFAULT_LOCALE,
  getLocaleDefinition,
  locales,
  LOCALE_STORAGE_KEY
} from './locales';

const translate = (locale, key, variables = {}) => {
  const template =
    translations[locale]?.[key] ?? translations[DEFAULT_LOCALE]?.[key] ?? key;

  return Object.entries(variables).reduce(
    (message, [name, value]) =>
      message.replaceAll(`{{${name}}}`, String(value)),
    template
  );
};

const LocaleContext = createContext({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key, variables) => translate(DEFAULT_LOCALE, key, variables),
  dateLocale: getLocaleDefinition(DEFAULT_LOCALE).dateLocale
});

const getInitialLocale = () => {
  const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return locales.some(({ id }) => id === storedLocale)
    ? storedLocale
    : DEFAULT_LOCALE;
};

export const LocaleProvider = ({ children }) => {
  const [locale, setLocale] = useState(getInitialLocale);

  useEffect(() => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback(
    (key, variables = {}) => translate(locale, key, variables),
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      dateLocale: getLocaleDefinition(locale).dateLocale
    }),
    [locale, t]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = () => {
  return useContext(LocaleContext);
};
