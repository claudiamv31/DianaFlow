import { Link } from 'react-router-dom';
import { FaMoon } from 'react-icons/fa';

import './Header.css';

const HeaderNotLogged = () => {
  return (
    <header className="header">
      {/* Logo */}
      <Link to={'/'}>
        <div className="header-logo">
          <FaMoon className="moon-icon" />
          <h1>DianaFlow</h1>
        </div>
      </Link>
    </header>
  );
};

export default HeaderNotLogged;
