import { DEFAULT_LOCALE, supportedLocales } from './locales';
import { resources } from './resources';
import { GUIDANCE_KEYS } from './guidance';
import { API_ERROR_TRANSLATION_KEYS } from '../api/AppError';
import { FLOW_CODES, REGULARITY_CODES } from './domainCodes';

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

  test('every plural stem provides every category required by its locale', () => {
    supportedLocales.forEach(({ code }) => {
      const keys = Object.keys(resources[code].translation);
      const categories = new Intl.PluralRules(code).resolvedOptions()
        .pluralCategories;
      const pluralSuffix = /_(zero|one|two|few|many|other)$/;
      const stems = new Set(
        keys
          .filter((key) => pluralSuffix.test(key))
          .map((key) => key.replace(pluralSuffix, ''))
      );

      stems.forEach((stem) => {
        categories.forEach((category) => {
          expect(keys).toContain(`${stem}_${category}`);
        });
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

  test('every active locale covers every presentation code', () => {
    supportedLocales.forEach(({ code }) => {
      FLOW_CODES.forEach((flowCode) => {
        expect(resources[code].translation[`flow.${flowCode}`]).toBeTruthy();
      });
      REGULARITY_CODES.forEach((regularityCode) => {
        expect(
          resources[code].translation[`regularity.${regularityCode}`]
        ).toBeTruthy();
      });
    });
  });
});
