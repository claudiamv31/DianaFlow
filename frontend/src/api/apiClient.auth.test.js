import {
  isAccessTokenExpired,
  normalizeApiRootUrl,
  refreshAccessToken
} from './apiClient';

jest.mock('axios', () => {
  const client = {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  };

  return {
    __esModule: true,
    default: {
      create: jest.fn(() => client),
      request: jest.fn()
    }
  };
});

const createToken = (payload) => {
  const encode = (value) =>
    btoa(JSON.stringify(value))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  return `${encode({ alg: 'none', typ: 'JWT' })}.${encode(payload)}.`;
};

describe('access-token startup checks', () => {
  test('refreshes an expired access token instead of treating it as a live session', () => {
    const expiredToken = createToken({ exp: Math.floor(Date.now() / 1000) - 1 });

    expect(isAccessTokenExpired(expiredToken)).toBe(true);
  });

  test('keeps a token that has not expired', () => {
    const validToken = createToken({ exp: Math.floor(Date.now() / 1000) + 60 });

    expect(isAccessTokenExpired(validToken)).toBe(false);
  });
});

describe('refresh-token requests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('normalizes an API URL before appending the refresh endpoint', () => {
    expect(normalizeApiRootUrl('https://example.test/api/')).toBe(
      'https://example.test'
    );
  });

  test('sends refresh requests with credentials', async () => {
    const axios = require('axios').default;
    axios.request.mockResolvedValueOnce({
      data: { accessToken: 'new-access-token' }
    });

    await expect(refreshAccessToken()).resolves.toBe('new-access-token');

    expect(axios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'post',
        url: expect.stringMatching(/\/api\/users\/refresh$/),
        withCredentials: true,
        data: {}
      })
    );
  });
});
