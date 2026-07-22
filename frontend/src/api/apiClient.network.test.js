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
});
