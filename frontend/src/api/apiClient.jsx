import axios from 'axios';
import { API_URL } from '../config';
import { getClientTimeZone } from '../utils/timeZone';

const ACCESS_TOKEN_KEY = 'jwtToken';
let refreshRequest = null;

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
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

const refreshAccessToken = async () => {
  if (!refreshRequest) {
    refreshRequest = axios
      .post(
        `${API_URL}/api/users/refresh`,
        {},
        { timeout: 30000, withCredentials: true }
      )
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

    if (error.code === 'ECONNABORTED') {
      return Promise.reject(
        new Error('⏱ Timeout error. The API did not respond.')
      );
    }
    if (!error.response) {
      return Promise.reject(new Error('No connection with the server.'));
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
  const token = getAccessToken();
  if (!token) {
    return null;
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
    if (getAccessToken()) {
      await apiClient.post('/users/logout');
    }
  } finally {
    clearAuthTokens();
  }
};

apiClient.login = async (email, password) => {
  const response = await apiClient.post('/users/login', { email, password });
  if (response.status === 200) {
    storeAuthTokens(response.data);
  } else {
    throw new Error('Error logging in');
  }
  return response.data;
};

apiClient.signUp = async (userData) => {
  const response = await apiClient.post('/users/sign-up', userData);
  if (!response.ok) {
    throw new Error('Error signing up');
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
