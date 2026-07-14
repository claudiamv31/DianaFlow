import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaMoon } from 'react-icons/fa';

import './Header.css';
import ErrorScreen from '../ErrorScreen';

const Header = () => {
  const [error] = useState(false);

  document.querySelectorAll('nav a').forEach((link) => {
    if (link.href === window.location.href) {
      link.classList.add('active');
    }
  });

  // Cierra si haces click fuera
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (menuRef.current && !menuRef.current.contains(event.target)) {
  //       setUserMenuOpen(false);
  //     }
  //   };
  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => document.removeEventListener('mousedown', handleClickOutside);
  // }, []);

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
        <h1>DianaFlow</h1>
      </NavLink>

      {/* User */}
      <div className="options">
        {/*<NavLink to="/config" className="user-menu-link">
          <FontAwesomeIcon icon={faUser} className="user-icon" />
        </NavLink>*/}
      </div>
    </header>
  );
};

export default Header;
