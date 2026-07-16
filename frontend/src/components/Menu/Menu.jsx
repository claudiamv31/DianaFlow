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
import { useLocale } from '../../i18n/LocaleContext';

const Menu = () => {
  const { t } = useLocale();

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
          {t('nav.home')}
        </NavLink>
        <span className="divider"></span>
        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            isActive ? 'nav-link active' : 'nav-link'
          }
        >
          <FontAwesomeIcon icon={faCalendar} className="nav-icon" />
          {t('nav.calendar')}
        </NavLink>
        <span className="divider"></span>
        <NavLink
          to="/stats"
          className={({ isActive }) =>
            isActive ? 'nav-link active' : 'nav-link'
          }
        >
          <FontAwesomeIcon icon={faArrowTrendUp} className="nav-icon" />
          {t('nav.stats')}
        </NavLink>
        <NavLink
          to="/configuration"
          className={({ isActive }) =>
            isActive ? 'nav-link active' : 'nav-link'
          }
        >
          <FontAwesomeIcon icon={faGear} className="nav-icon" />
          {t('nav.settings')}
        </NavLink>
      </nav>
    </div>
  );
};

export default Menu;
