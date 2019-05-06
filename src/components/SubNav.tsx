import React from 'react';
import { NavLink } from 'react-router-dom';

import { ChartSchema } from '../data/charts';

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
              {chart.key}
            </NavLink>
          ))}
        </div>
        <div className="navbar-end">
          <NavLink
            activeClassName="is-active"
            className="navbar-item"
            to="/inputs"
          >
            Slider settings
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default SubNav;
