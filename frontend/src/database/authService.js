import apiClient from '../api/apiClient';

export const login = async (email, password) => {
  return apiClient.login(email, password);
};

export const register = async (email, password, name, lastName) => {
  // Ahora manejamos el registro directo en el componente (SignUp.jsx)
  // Pero dejamos la función viva por si algún otro componente la llama
  return {};
};

export function checkUser(callback) {
  const verifyToken = async () => {
    const user = await apiClient.checkUser();
    if (user) {
      callback(user);
    } else {
      callback(null);
    }
  };

  verifyToken();
  return () => {};
}


export const logout = async () => {
  await apiClient.logout();
};
