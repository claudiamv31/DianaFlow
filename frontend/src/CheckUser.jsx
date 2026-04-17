import { useEffect, useState } from 'react';
import './App.css';
import { NavLink } from 'react-router-dom';

function CheckUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Escuchar el estado de autenticación
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user); // guarda el usuario en estado
        const idToken = await user.getIdToken(true);
        console.log('🔐 Token obtenido:', idToken);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="App">
      <h1>Firebase + .NET API</h1>
      {user ? (
        <NavLink to="/" />
      ) : (
        <NavLink to="/login">
          <div>
            <p>Inicia Sesion</p>
          </div>
        </NavLink>
      )}
    </div>
  );
}

export default CheckUser;
