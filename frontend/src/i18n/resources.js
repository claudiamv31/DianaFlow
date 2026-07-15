import enUS from './catalogues/en-US';
import esMX from './catalogues/es-MX';
import { createPseudoCatalogue } from './pseudoLocale';

export const resources = {
  'en-US': { translation: enUS },
  'es-MX': { translation: esMX },
  ...(process.env.NODE_ENV === 'development'
    ? { 'en-XA': { translation: createPseudoCatalogue(enUS) } }
    : {})
};
