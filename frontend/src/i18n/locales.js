export const DEFAULT_LOCALE = 'en-US';
export const LOCALE_STORAGE_KEY = 'dianaFlowLocale';

export const supportedLocales = [
  { code: 'en-US', language: 'en', label: 'English', direction: 'ltr' },
  { code: 'es-MX', language: 'es', label: 'Español', direction: 'ltr' }
];

export const DEVELOPMENT_LOCALE = {
  code: 'en-XA',
  language: 'en',
  label: '[Pseudo]',
  direction: 'ltr'
};

export const selectableLocales =
  process.env.NODE_ENV === 'development'
    ? [...supportedLocales, DEVELOPMENT_LOCALE]
    : supportedLocales;

export const isSupportedLocale = (locale) =>
  selectableLocales.some(({ code }) => code === locale);

export const getLocaleDefinition = (locale) =>
  selectableLocales.find(({ code }) => code === locale) || supportedLocales[0];

export const matchSupportedLocale = (requestedLocales = []) => {
  for (const requestedLocale of requestedLocales) {
    const exactMatch = supportedLocales.find(
      ({ code }) => code.toLowerCase() === requestedLocale?.toLowerCase()
    );
    if (exactMatch) return exactMatch.code;

    const requestedLanguage = requestedLocale?.split('-')[0].toLowerCase();
    const languageMatch = supportedLocales.find(
      ({ language }) => language === requestedLanguage
    );
    if (languageMatch) return languageMatch.code;
  }

  return DEFAULT_LOCALE;
};
