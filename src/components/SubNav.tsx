import React from 'react';
import { NavLink } from 'react-router-dom';

import LocaleMessage from './LocaleMessage';

import { ChartSchema } from '../data/charts';

const SingleVariantChartItem = ({ chart }: { chart: ChartSchema }) => {
  return (
    <NavLink
      activeClassName="is-active"
      className="navbar-item"
      key={`subnav-chart-${chart.slug}`}
      to={`/charts/${chart.slug}`}
    >
      <LocaleMessage id={`chart.${chart.key}`} />
    </NavLink>
  );
};

const MultiVariantChartItem = ({ chart }: { chart: ChartSchema }) => {
  const variantItems = chart.variants.map(variant => {
    const url = `/charts/${chart.slug}/${variant.slug}`;

    return (
      <NavLink
        key={url}
        className="navbar-item"
        activeClassName="is-active"
        to={url}
      >
        <LocaleMessage id={`chart.variant.${variant.key}`} />
      </NavLink>
    );
  });

  return (
    <div className="navbar-item has-dropdown is-hoverable">
      <NavLink
        className="navbar-link"
        activeClassName="is-active"
        to={`/charts/${chart.slug}`}
      >
        <LocaleMessage id={`chart.${chart.key}`} />
      </NavLink>
      <div className="navbar-dropdown is-boxed">{variantItems}</div>
    </div>
  );
};

const chartItem = (chart: ChartSchema) => {
  const key = `subnav-chart-${chart.slug}`;

  if (chart.variants.length > 1) {
    return <MultiVariantChartItem chart={chart} key={key} />;
  }

  return <SingleVariantChartItem chart={chart} key={key} />;
};

const SubNav = ({ charts }: { charts: ChartSchema[] }) => {
  return (
    <nav id="subnav" className="navbar is-light">
      <div className="container">
        <div className="navbar-start">{charts.map(chartItem)}</div>
        <div className="navbar-end">
          <NavLink
            activeClassName="is-active"
            className="navbar-item"
            to="/inputs"
          >
            <LocaleMessage id="app.sliderSettings" />
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default SubNav;
