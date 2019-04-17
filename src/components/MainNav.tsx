import React, { Component } from 'react';

const MainNav = () => (
  <nav
    className="navbar is-light"
    role="navigation"
    aria-label="main navigation"
  >
    <div className="container">
      <div className="navbar-brand">
        <div className="navbar-item">
          <strong>Multi-Year Charts</strong>
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
          <div className="navbar-item">
            <a className="button is-light">← Back to the ETM</a>
          </div>
        </div>
      </div>
    </div>
  </nav>
);

export default MainNav;
