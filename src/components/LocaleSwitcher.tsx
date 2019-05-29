import React, { FC } from 'react';

import langIcon from '../images/language.svg';

interface LocaleSwitcherProps {
  currentLocale: string;
  setLocale: (id: string) => void;
}

/**
 * Dropdown used in the MainNav to switch the UI from one locale to another.
 */
const LocaleSwitcher: FC<LocaleSwitcherProps> = props => {
  const setLocaleWithEvent = (name: string) => {
    return (event: React.MouseEvent) => {
      props.setLocale(name);
      event.preventDefault();
    };
  };

  return (
    <div className="navbar-item has-dropdown is-hoverable language-selector">
      <div className="navbar-item">
        <button className="navbar-link is-dark button is-small">
          <img src={langIcon} alt="Change language" width="18" height="18" />
        </button>
      </div>
      <div className="navbar-dropdown is-boxed">
        <a className="navbar-item" href="" onClick={setLocaleWithEvent('en')}>
          English
        </a>
        <a className="navbar-item" href="" onClick={setLocaleWithEvent('nl')}>
          Nederlands
        </a>
      </div>
    </div>
  );
};

export default LocaleSwitcher;
