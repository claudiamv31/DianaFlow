import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse,
  faCalendar,
  faArrowTrendUp,
  faGear
} from '@fortawesome/free-solid-svg-icons';
import './Menu.css';

const Menu = () => {
  return (
    <div className="menu-container">
      <nav className="nav-links">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? 'nav-link active' : 'nav-link'
          }
        >
          <FontAwesomeIcon icon={faHouse} className="nav-icon" />
          Home
        </NavLink>
        <span className="divider"></span>
        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            isActive ? 'nav-link active' : 'nav-link'
          }
        >
          <FontAwesomeIcon icon={faCalendar} className="nav-icon" />
          Calendar
        </NavLink>
        <span className="divider"></span>
        <NavLink
          to="/stats"
          className={({ isActive }) =>
            isActive ? 'nav-link active' : 'nav-link'
          }
        >
          <FontAwesomeIcon icon={faArrowTrendUp} className="nav-icon" />
          Stats
        </NavLink>
        <NavLink
          to="/configuration"
          className={({ isActive }) =>
            isActive ? 'nav-link active' : 'nav-link'
          }
        >
          <FontAwesomeIcon icon={faGear} className="nav-icon" />
          Settings
        </NavLink>
      </nav>
    </div>
  );
};

export default Menu;
