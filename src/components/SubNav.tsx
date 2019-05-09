import React from 'react';
import { NavLink } from 'react-router-dom';

import { ChartSchema } from '../data/charts';

import translate from '../utils/translate';
import translations from '../data/locales/nl.json';

const SubNav = ({ charts }: { charts: ChartSchema[] }) => {
  return (
    <nav id="subnav" className="navbar is-light">
      <div className="container">
        <div className="navbar-start">
          {charts.map(chart => (
            <NavLink
              activeClassName="is-active"
              className="navbar-item"
              key={`subnav-chart-${chart.slug}`}
              to={`/charts/${chart.slug}`}
            >
              {translate(`chart.${chart.key}`, translations)}
            </NavLink>
          ))}
        </div>
        <div className="navbar-end">
          <NavLink
            activeClassName="is-active"
            className="navbar-item"
            to="/inputs"
          >
            {translate('app.sliderSettings', translations)}
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default SubNav;
