import axios from 'axios';
import { API_URL } from '../config';
import { getClientTimeZone } from '../utils/timeZone';
import { AppError } from './AppError';
import {
  getNetworkErrorMessageKey,
  isColdStartError
} from './networkError';

const ACCESS_TOKEN_KEY = 'jwtToken';
const REQUEST_TIMEOUT_MS = 45000;
const COLD_START_RETRY_DELAYS_MS = [1500, 3500];
let refreshRequest = null;
let activeColdStartRetries = 0;

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: REQUEST_TIMEOUT_MS,
  withCredentials: true
});

const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

const clearAuthTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
};

const storeAuthTokens = (tokens = {}) => {
  const accessToken = tokens.accessToken;

  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }
};

const shouldSkipRefresh = (config = {}) => {
  const url = config.url || '';
  return url.includes('/users/login') || url.includes('/users/refresh');
};

const sleep = (delayMs) =>
  new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });

const canRetryColdStart = (config = {}) => {
  const method = (config.method || 'get').toLowerCase();
  const url = config.url || '';

  return (
    ['get', 'head', 'options', 'put', 'delete'].includes(method) ||
    (method === 'post' && url.includes('/users/login')) ||
    (method === 'post' && url.includes('/users/sign-up')) ||
    (method === 'post' && url.includes('/users/refresh'))
  );
};

const notifyColdStartRetry = (isRetrying) => {
  if (typeof window === 'undefined') {
    return;
  }

  activeColdStartRetries += isRetrying ? 1 : -1;
  activeColdStartRetries = Math.max(0, activeColdStartRetries);

  window.dispatchEvent(
    new CustomEvent('dianaflow:cold-start-retry', {
      detail: { isRetrying: activeColdStartRetries > 0 }
    })
  );
};

const requestWithColdStartRetry = async (requestConfig) => {
  try {
    return await axios.request(requestConfig);
  } catch (error) {
    const config = error.config || requestConfig;
    const retryCount = config._coldStartRetryCount || 0;

    if (
      retryCount < COLD_START_RETRY_DELAYS_MS.length &&
      canRetryColdStart(config) &&
      isColdStartError(error)
    ) {
      notifyColdStartRetry(true);

      try {
        await sleep(COLD_START_RETRY_DELAYS_MS[retryCount]);

        return await requestWithColdStartRetry({
          ...config,
          timeout: REQUEST_TIMEOUT_MS,
          _coldStartRetryCount: retryCount + 1
        });
      } finally {
        notifyColdStartRetry(false);
      }
    }

    throw error;
  }
};

const refreshAccessToken = async () => {
  if (!refreshRequest) {
    refreshRequest = requestWithColdStartRetry({
      method: 'post',
      url: `${API_URL}/api/users/refresh`,
      data: {},
      timeout: REQUEST_TIMEOUT_MS,
      withCredentials: true
    })
      .then((response) => {
        storeAuthTokens(response.data);
        return response.data.accessToken;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      originalRequest &&
      !originalRequest._retry &&
      canRetryColdStart(originalRequest) &&
      isColdStartError(error)
    ) {
      const retryCount = originalRequest._coldStartRetryCount || 0;

      if (retryCount < COLD_START_RETRY_DELAYS_MS.length) {
        originalRequest._coldStartRetryCount = retryCount + 1;
        originalRequest.timeout = REQUEST_TIMEOUT_MS;

        notifyColdStartRetry(true);

        try {
          await sleep(COLD_START_RETRY_DELAYS_MS[retryCount]);

          return await apiClient(originalRequest);
        } finally {
          notifyColdStartRetry(false);
        }
      }
    }

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !shouldSkipRefresh(originalRequest)
    ) {
      originalRequest._retry = true;

      try {
        const accessToken = await refreshAccessToken();
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        clearAuthTokens();
        return Promise.reject(refreshError);
      }
    }

    const networkErrorMessageKey = getNetworkErrorMessageKey(error);
    if (networkErrorMessageKey) {
      return Promise.reject(new AppError(networkErrorMessageKey));
    }
    return Promise.reject(error);
  }
);

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  config.headers = config.headers || {};
  config.headers['X-User-Time-Zone'] = getClientTimeZone();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Prepend /api if not already present and not an absolute URL
  if (
    config.url &&
    !config.url.startsWith('/api') &&
    !config.url.startsWith('api') &&
    !config.url.startsWith('http')
  ) {
    const separator = config.url.startsWith('/') ? '' : '/';
    config.url = `/api${separator}${config.url}`;
  }

  return config;
});

apiClient.checkUser = async () => {
  let token = getAccessToken();

  if (!token) {
    try {
      token = await refreshAccessToken();
    } catch (error) {
      clearAuthTokens();
      return null;
    }
  }

  try {
    const response = await apiClient.get('/users/me');
    return response.data;
  } catch (error) {
    clearAuthTokens();
    return null;
  }
};

apiClient.logout = async () => {
  try {
    await apiClient.post('/users/logout');
  } catch {
    // Local logout should still complete if the server-side session already expired.
  } finally {
    clearAuthTokens();
  }
};

apiClient.login = async (email, password) => {
  const response = await apiClient.post('/users/login', { email, password });
  if (response.status === 200) {
    storeAuthTokens(response.data);
  } else {
    throw new AppError('auth.error.login');
  }
  return response.data;
};

apiClient.signUp = async (userData) => {
  const response = await apiClient.post('/users/sign-up', userData);
  if (!response.ok) {
    throw new AppError('auth.error.signup');
  }
  return response.data;
};

apiClient.getProfile = async () => {
  const response = await apiClient.get('/profile');
  return response.data;
};

apiClient.updateProfile = async (updateData) => {
  const response = await apiClient.put('/profile', updateData);
  return response.data;
};

apiClient.uploadAvatar = async (formData) => {
  const response = await apiClient.post('/profile/upload-avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

apiClient.changePassword = async (passwordData) => {
  const response = await apiClient.post(
    '/profile/change-password',
    passwordData
  );
  return response.data;
};

export default apiClient;
