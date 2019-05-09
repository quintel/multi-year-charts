import React from 'react';

import translate from '../utils/translate';
import translations from '../data/locales/nl.json';

const MainNav = () => (
  <nav
    className="navbar is-dark"
    role="navigation"
    aria-label="main navigation"
  >
    <div className="container">
      <div className="navbar-brand">
        <div className="navbar-item">
          <b>{translate('app.title', translations)}</b>
        </div>
        <a
          role="button"
          className="navbar-burger"
          aria-label="menu"
          aria-expanded="false"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </a>
      </div>

      <div className="navbar-menu">
        <div className="navbar-end">
          <a className="navbar-item" href={process.env.REACT_APP_ETMODEL_URL}>
            ← {translate('app.backToETM', translations)}
          </a>
        </div>
      </div>
    </div>
  </nav>
);

export default MainNav;
