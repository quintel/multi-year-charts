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
  <li
    key={`chart-selector-${chart.key}`}
    className={isActive ? 'is-active' : ''}
  >
    <a onClick={() => onClick(chart.key)}>{chart.key}</a>
  </li>
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
        <div className="chart" style={{ width: '960px', height: '550px' }}>
          <ChartWrapper chart={currentChart} />
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
      <div className="tabs">
        <ul>
          {this.props.charts.map(chart =>
            renderChartTab(
              chart,
              this.setCurrentChart,
              this.currentChart() === chart
            )
          )}
        </ul>
      </div>
    );
  }

  private setCurrentChart(chartKey: string) {
    this.setState({ currentChart: chartKey });
  }
}
