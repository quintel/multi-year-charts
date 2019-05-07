import React, { Component } from 'react';

import { connect } from 'react-redux';

import { AppState } from '../store/types';
import { ChartSchema } from '../data/charts';
import { ScenarioIndexedScenarioData } from '../utils/api/types';

import TestChart from './TestChart';
import { scenariosToChartData } from '../utils/charts';

import { addQueries, apiFetch, removeQueries } from '../store/actions';

interface ChartWrapperProps {
  chart: ChartSchema;
  scenarios: ScenarioIndexedScenarioData;
  addQueries: (keys: string[]) => void;
  apiFetch: () => void;
  removeQueries: (keys: string[]) => void;
}

/**
 * Returns whether the scenario data has all of the values needed to render the
 * chart.
 */
const canRenderChart = (
  series: ChartSchema,
  scenarios: ScenarioIndexedScenarioData
) => {
  const ids = Object.keys(scenarios);

  if (ids.length === 0) {
    return false;
  }

  return series.series.every(series =>
    ids.every(id => scenarios[parseInt(id, 10)].gqueries.hasOwnProperty(series))
  );
};

class ChartWrapper extends Component<ChartWrapperProps> {
  render() {
    return (
      <div>
        {canRenderChart(this.props.chart, this.props.scenarios) ? (
          <TestChart
            series={scenariosToChartData(
              this.props.scenarios,
              this.props.chart.series
            )}
          />
        ) : (
          this.renderLoading()
        )}
      </div>
    );
  }

  private renderLoading() {
    return <progress className="progress is-info is-primary" max="100" />;
  }

  componentDidMount() {
    this.props.addQueries(this.props.chart.series);
    this.props.apiFetch();
  }

  componentDidUpdate(prevProps: ChartWrapperProps) {
    if (prevProps.chart.key !== this.props.chart.key) {
      this.props.removeQueries(prevProps.chart.series);
      this.props.addQueries(this.props.chart.series);
      this.props.apiFetch();
    }
  }

  componentWillUnmount() {
    this.props.removeQueries(this.props.chart.series);
  }
}

const mapStateToProps = (state: AppState) => ({
  scenarios: state.scenarioData
});

export default connect(
  mapStateToProps,
  { addQueries, apiFetch, removeQueries }
)(ChartWrapper);
