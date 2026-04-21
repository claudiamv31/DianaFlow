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
  const token = localStorage.getItem('jwtToken');
  
  if (token) {
    // Si hay token asumimos que está logueado por el momento.
    // (En una app real aquí decodificarías el JWT para sacar el email y nombre del usuario)
    callback({ isAuthenticated: true });
  } else {
    callback(null);
  }

  return () => {};
}

export const logout = async () => {
  localStorage.removeItem('jwtToken');
};
