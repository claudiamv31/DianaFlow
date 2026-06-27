import axios from 'axios';
import { API_URL } from '../config';
import { getClientTimeZone } from '../utils/timeZone';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
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
  const token = localStorage.getItem('jwtToken');

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
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    return null;
  }
  try {
    const response = await apiClient.get('/users/me');
    return response.data;
  } catch (error) {
    localStorage.removeItem('jwtToken');
    return null;
  }
};

apiClient.logout = async () => {
  localStorage.removeItem('jwtToken');
};

apiClient.login = async (email, password) => {
  const response = await apiClient.post('/users/login', { email, password });
  if (response.status === 200) {
    localStorage.setItem('jwtToken', response.data.token);
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
