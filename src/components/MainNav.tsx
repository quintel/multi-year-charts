import React, { useContext } from 'react';

import LocaleContext from '../utils/LocaleContext';
import LocaleMessage from './LocaleMessage';
import LocaleSwitcher from './LocaleSwitcher';

const MainNav = () => {
  const { currentLocale, setLocale } = useContext(LocaleContext);

  return (
    <nav
      id="main-nav"
      className="navbar is-dark"
      role="navigation"
      aria-label="main navigation"
    >
      <div className="container">
        <div className="navbar-brand">
          <div className="navbar-item">
            <b>
              <LocaleMessage id="app.title" />
            </b>
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
            <LocaleSwitcher
              currentLocale={currentLocale}
              setLocale={setLocale}
            />

            <div className="navbar-item">
              <div className="field is-grouped">
                <p className="control">
                  <a
                    className="button is-link is-small"
                    href={process.env.REACT_APP_ETMODEL_URL}
                  >
                    ← <LocaleMessage id="app.backToETM" />
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MainNav;
