import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5039/api/',
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
  console.log('Axios Interceptor Token:', token ? 'Exists' : 'EMPTY');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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

// Profile API methods
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
