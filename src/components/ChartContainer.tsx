import React, { Component } from 'react';

import ChartWrapper from './ChartWrapper';
import { ChartSchema } from '../data/charts';

interface ChartContainerProps {
  charts: ChartSchema[];
}

interface ChartContainerState {
  currentChart?: string;
}

const renderChartTab = (
  chart: ChartSchema,
  onClick: (key: string) => void,
  isActive: boolean
) => (
  <a
    onClick={() => onClick(chart.key)}
    key={`chart-selector-${chart.key}`}
    className={`navbar-item ${isActive ? 'is-active' : ''}`}
  >
    {chart.key}
  </a>
);

/**
 * The main component which displays the available chart types, and renders the
 * selected chart.
 */
export default class ChartContainer extends Component<
  ChartContainerProps,
  ChartContainerState
> {
  state = { currentChart: undefined };

  constructor(props: ChartContainerProps) {
    super(props);
    this.setCurrentChart = this.setCurrentChart.bind(this);
  }

  render() {
    const currentChart = this.currentChart();

    return (
      <div className="chart-container">
        {this.renderAvailableChartTabs()}
        <div className="container">
          <div className="chart">
            <ChartWrapper chart={currentChart} />
          </div>
        </div>
      </div>
    );
  }

  private currentChart() {
    let stateChart;

    if (this.state.currentChart) {
      stateChart = this.props.charts.find(
        chart => chart.key == this.state.currentChart
      );
    }

    return stateChart || this.props.charts[0];
  }

  private renderAvailableChartTabs() {
    return (
      <nav className="navbar is-light">
        <div className="container">
          <div className="navbar-start">
            {this.props.charts.map(chart =>
              renderChartTab(
                chart,
                this.setCurrentChart,
                this.currentChart() === chart
              )
            )}
          </div>
        </div>
      </nav>
    );
  }

  private setCurrentChart(chartKey: string) {
    this.setState({ currentChart: chartKey });
  }
}
