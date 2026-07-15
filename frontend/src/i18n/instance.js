import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LOCALE, selectableLocales } from './locales';
import { resources } from './resources';

i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: selectableLocales.map(({ code }) => code),
  load: 'currentOnly',
  initImmediate: false,
  interpolation: {
    escapeValue: false
  },
  returnNull: false
});

export default i18n;
