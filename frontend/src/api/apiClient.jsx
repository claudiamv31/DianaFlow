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
        new Error('⏱ Tiempo de espera agotado. La API no respondió.')
      );
    }
    if (!error.response) {
      return Promise.reject(new Error('❌ No hay conexión con el servidor.'));
    }
    return Promise.reject(error);
  }
);

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  console.log("Axios Interceptor Token:", token ? "Exists" : "EMPTY");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;
