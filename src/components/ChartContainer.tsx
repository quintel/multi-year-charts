import React, { Component } from 'react';

import ChartWrapper from './ChartWrapper';
import { ChartSchema } from '../data/charts';

interface ChartContainerProps {
  charts: ChartSchema[];
}

interface ChartContainerState {
  currentChart?: string;
}

const renderChartTab = (chart: ChartSchema, onClick: (key: string) => void) => (
  <li key={`chart-selector-${chart.key}`}>
    <button onClick={() => onClick(chart.key)}>{chart.key}</button>
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
        <h2> {currentChart.key}</h2>
        <div
          className="chart"
          style={{ border: '1px solid #ddd', width: '800px', height: '550px' }}
        >
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
      <ul className="available-charts">
        {this.props.charts.map(chart =>
          renderChartTab(chart, this.setCurrentChart)
        )}
      </ul>
    );
  }

  private setCurrentChart(chartKey: string) {
    this.setState({ currentChart: chartKey });
  }
}
