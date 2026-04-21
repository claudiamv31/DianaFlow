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

apiClient.checkUser = async () => {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    return null;
  }
  const response = await apiClient.get('/users/me');
  return response.data;
};

apiClient.logout = async () => {
  localStorage.removeItem('jwtToken');
};  

apiClient.login = async (email, password) => {
  const response = await apiClient.post('/users/login', { email, password });
  if (response.status === 200) {
    localStorage.setItem('jwtToken', response.data.token);
  }else{
    throw new Error('❌ Error al iniciar sesión');
  }
  return response.data;
};

export default apiClient;
