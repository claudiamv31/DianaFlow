import {
  API_ERROR_TRANSLATION_KEYS,
  getErrorMessageKey
} from './AppError';

describe('API error localization contract', () => {
  test('maps a machine-readable API error code to frontend copy', () => {
    const error = {
      response: {
        data: { code: 'INVALID_CREDENTIALS', field: 'password' }
      }
    };

    expect(getErrorMessageKey(error, 'error.generic')).toBe(
      'auth.error.invalidPassword'
    );
  });

  test('falls back safely for an unknown API error code', () => {
    const error = { response: { data: { code: 'NOT_DEPLOYED_YET' } } };

    expect(getErrorMessageKey(error, 'error.generic')).toBe('error.generic');
  });

  test('documents every supported API error mapping', () => {
    expect(Object.keys(API_ERROR_TRANSLATION_KEYS)).toContain(
      'INVALID_CREDENTIALS'
    );
  });
});
