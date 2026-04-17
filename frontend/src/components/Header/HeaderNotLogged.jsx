import { useState, useRef, useEffect } from 'react';
import { logout } from '../../firebase/authService';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FaMoon } from 'react-icons/fa';

import './Header.css';
import ErrorScreen from '../ErrorScreen';

const HeaderNotLogged = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef();
  const [error, setError] = useState(false);

  // Cierra si haces click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError(true);
    }
  };

  if (error) return <ErrorScreen />;

  return (
    <header className="header">
      {/* Logo */}
      <Link to={'/'}>
        <div className="header-logo">
          <FaMoon className="moon-icon" />
          <h1>Shine</h1>
        </div>
      </Link>
    </header>
  );
};

export default HeaderNotLogged;
