import apiClient from '../api/apiClient';

export const login = async (email, password) => {
  const res = await fetch('http://localhost:5039/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    throw new Error('Credenciales inválidas');
  }

  const data = await res.json();
  localStorage.setItem('jwtToken', data.token);
  return data;
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
  localStorage.removeItem('jwtToken');
};
