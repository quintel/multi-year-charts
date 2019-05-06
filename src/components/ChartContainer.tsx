import React, { Component } from 'react';

import ChartWrapper from './ChartWrapper';
import { ChartSchema } from '../data/charts';

interface ChartContainerProps {
  charts: ChartSchema[];
  activeChart?: string;
}

/**
 * The main component which displays the available chart types, and renders the
 * selected chart.
 */
export default class ChartContainer extends Component<ChartContainerProps, {}> {
  state = { activeChart: undefined };

  constructor(props: ChartContainerProps) {
    super(props);
  }

  render() {
    return (
      <div className="chart-container">
        <div className="container">
          <div className="chart">
            <ChartWrapper chart={this.activeChart()} />
          </div>
        </div>
      </div>
    );
  }

  private activeChart() {
    let chart;

    if (this.props.activeChart) {
      chart = this.props.charts.find(
        chart => chart.slug == this.props.activeChart
      );
    }

    return chart || this.props.charts[0];
  }
}
