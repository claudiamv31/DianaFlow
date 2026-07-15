import { DEFAULT_LOCALE, supportedLocales } from './locales';
import { resources } from './resources';
import { GUIDANCE_KEYS } from './guidance';
import { API_ERROR_TRANSLATION_KEYS } from '../api/AppError';

describe('supported locale contract', () => {
  test('every active locale contains the complete canonical catalogue', () => {
    const canonicalKeys = Object.keys(resources[DEFAULT_LOCALE].translation).sort();

    supportedLocales.forEach(({ code }) => {
      expect(Object.keys(resources[code].translation).sort()).toEqual(
        canonicalKeys
      );
    });
  });

  test('every locale uses the same interpolation variables', () => {
    const variables = (message) =>
      [...message.matchAll(/{{\s*([^},\s]+).*?}}/g)]
        .map(([, name]) => name)
        .sort();
    const canonical = resources[DEFAULT_LOCALE].translation;

    supportedLocales.forEach(({ code }) => {
      Object.entries(canonical).forEach(([key, message]) => {
        expect(variables(resources[code].translation[key])).toEqual(
          variables(message)
        );
      });
    });
  });

  test('every plural key provides both singular and plural forms', () => {
    supportedLocales.forEach(({ code }) => {
      const keys = Object.keys(resources[code].translation);
      keys
        .filter((key) => key.endsWith('_one'))
        .forEach((key) => {
          expect(keys).toContain(key.replace(/_one$/, '_other'));
        });
    });
  });

  test('every active locale covers every backend guidance key', () => {
    supportedLocales.forEach(({ code }) => {
      GUIDANCE_KEYS.forEach((key) => {
        expect(resources[code].translation[key]).toBeTruthy();
      });
    });
  });

  test('every active locale covers every mapped API error', () => {
    supportedLocales.forEach(({ code }) => {
      Object.values(API_ERROR_TRANSLATION_KEYS).forEach((key) => {
        expect(resources[code].translation[key]).toBeTruthy();
      });
    });
  });
});
