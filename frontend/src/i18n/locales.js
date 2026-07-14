export const DEFAULT_LOCALE = 'en';
export const LOCALE_STORAGE_KEY = 'dianaFlowLocale';

export const locales = [
  {
    id: 'en',
    dateLocale: 'en-US',
    labelKey: 'language.english'
  },
  {
    id: 'es',
    dateLocale: 'es-MX',
    labelKey: 'language.spanish'
  }
];

export const getLocaleDefinition = (locale) =>
  locales.find(({ id }) => id === locale) || locales[0];
