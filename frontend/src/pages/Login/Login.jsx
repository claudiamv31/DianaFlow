import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { FaMoon, FaUser, FaLock } from 'react-icons/fa';
import PrimaryButton from '../../components/PrimaryButton';
import apiClient from '../../api/apiClient';
import Input from '../../components/Input';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      if (!email || !password) {
        alert('Por favor ingresa correo y contraseña');
        return;
      }
      
      apiClient.login(email, password);

      if  (apiClient.checkUser()) {
        navigate('/');
      }

    } catch (error) {
      console.error('❌ Error al iniciar sesión:', error);
      alert('Error al iniciar sesión');
    }
  };

  return (
    <div className="login-screen">
      <div className="login-logo">
        <FaMoon className="moon-icon" />
        <h1>Shine</h1>
      </div>
      <form onSubmit={handleLogin}>
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<FaUser />}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<FaLock />}
          buttonText="Mostrar"
          onButtonClick={() => alert('Toggle password')}
        />
        <PrimaryButton type="button" onClick={handleLogin}>
          Log In
        </PrimaryButton>
      </form>
      <div className="signup-text">
        Don't have an account <Link to={'/register'}>Sign Up</Link>
      </div>
    </div>
  );
}

export default Login;
