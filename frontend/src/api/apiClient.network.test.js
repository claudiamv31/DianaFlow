import {
  getNetworkErrorMessageKey,
  isColdStartError
} from './networkError';

describe('API client network-state messages', () => {
  test('describes an online network failure as a waking server', async () => {
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: true
    });

    expect(
      getNetworkErrorMessageKey({ message: 'Network Error' })
    ).toBe('network.waking');
    expect(isColdStartError({ message: 'Network Error' })).toBe(true);
  });

  test('only describes a network failure as offline when the browser is offline', () => {
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: false
    });

    expect(
      getNetworkErrorMessageKey({ message: 'Network Error' })
    ).toBe('network.offline');
    expect(isColdStartError({ message: 'Network Error' })).toBe(false);
  });

  test('treats an unclassified sign-up 400 as a cold-start response', () => {
    expect(
      isColdStartError(
        {
          response: { status: 400, data: {} }
        },
        { method: 'post', url: '/users/sign-up' }
      )
    ).toBe(true);
  });

  test('does not retry a classified sign-up validation 400', () => {
    expect(
      isColdStartError(
        {
          response: { status: 400, data: { code: 'EmailAlreadyInUse' } }
        },
        { method: 'post', url: '/users/sign-up' }
      )
    ).toBe(false);
  });

  test('treats an unclassified login 400 as a cold-start response', () => {
    expect(
      isColdStartError(
        {
          response: { status: 400, data: {} }
        },
        { method: 'post', url: '/users/login' }
      )
    ).toBe(true);
  });

  test('does not retry a classified login validation 400', () => {
    expect(
      isColdStartError(
        {
          response: { status: 400, data: { code: 'INVALID_CREDENTIALS' } }
        },
        { method: 'post', url: '/users/login' }
      )
    ).toBe(false);
  });
});
