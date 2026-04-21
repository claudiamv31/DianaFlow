import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { FaUser, FaMoon } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

import './Header.css';
import ErrorScreen from '../ErrorScreen';

const Header = () => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef();
  const [error, setError] = useState(false);

  document.querySelectorAll('nav a').forEach((link) => {
    if (link.href === window.location.href) {
      link.classList.add('active');
      console.log('Active link:', link.href);
    }
  });

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

  // const handleLogout = async () => {
  //   try {
  //     await logout();
  //     navigate('/login');
  //   } catch (err) {
  //     setError(true);
  //   }
  // };

  if (error) return <ErrorScreen />;

  return (
    <header className="header">
      {/* Logo */}
      <NavLink to="/" className="header-logo">
        <FaMoon className="moon-icon" />
        <h1>Shine</h1>
      </NavLink>

      {/* User */}
      <div className="options">
        <NavLink to="/config" className="user-menu-link">
          <FontAwesomeIcon icon={faUser} className="user-icon" />
        </NavLink>
      </div>
    </header>
  );
};

export default Header;
