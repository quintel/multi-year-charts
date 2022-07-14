import React, { Component } from 'react';

import ChartWrapper from './ChartWrapper';

import { ChartSchema } from '../data/charts';
import { flattenChart } from '../utils/charts';

import { Redirect } from 'react-router-dom';

interface ChartContainerProps {
  charts: ChartSchema[];
  activeChart?: string;
  activeVariant?: string;
}

/**
 * The main component which displays the available chart types, and renders the
 * selected chart.
 */
export default class ChartContainer extends Component<
  ChartContainerProps,
  Record<string, unknown>
> {
  state = { activeChart: undefined, activeVariant: undefined };

  constructor(props: ChartContainerProps) {
    super(props);
  }

  render() {
    const activeChart = this.activeChart();

    if (activeChart.variants.length > 1 && !this.props.activeVariant) {
      return <Redirect to={`/charts/${activeChart.slug}/${activeChart.variants[0].slug}`} />;
    }

    return (
      <div className="chart-container">
        <div className="container">
          <div className="chart">
            <ChartWrapper chart={flattenChart(activeChart, this.props.activeVariant)} />
          </div>
        </div>
      </div>
    );
  }

  private activeChart() {
    let chart;

    if (this.props.activeChart) {
      chart = this.props.charts.find(chart => chart.slug === this.props.activeChart);
    }

    return chart || this.props.charts[0];
  }
}
