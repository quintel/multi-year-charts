import React, { Component } from 'react';

import { connect } from 'react-redux';

import { AppState } from '../store/types';
import { FlattenedChartSchema } from '../data/charts';
import { ScenarioIndexedScenarioData } from '../utils/api/types';

import Chart from './Chart';
import ChartTable from './ChartTable';
import Loading from './Loading';
import { scenariosToChartData } from '../utils/charts';

import { addQueries, apiFetch, removeQueries } from '../store/actions';

interface ChartWrapperProps {
  activeVariant?: string;
  chart: FlattenedChartSchema;
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
  chart: FlattenedChartSchema,
  scenarios: ScenarioIndexedScenarioData
) => {
  const ids = Object.keys(scenarios);

  if (ids.length === 0) {
    return false;
  }

  return chart.series.every(series =>
    ids.every(id => scenarios[parseInt(id, 10)].gqueries.hasOwnProperty(series))
  );
};

class ChartWrapper extends Component<ChartWrapperProps> {
  render() {
    if (!canRenderChart(this.props.chart, this.props.scenarios)) {
      return (
        <div className="loading-chart">
          <Loading />
        </div>
      );
    }

    const series = scenariosToChartData(
      this.props.scenarios,
      this.props.chart.series
    );

    if (this.props.chart.displayAs === 'table') {
      return <ChartTable series={series} />;
    }

    return <Chart series={series} />;
  }

  componentDidMount() {
    this.props.addQueries(this.props.chart.series);
    this.props.apiFetch();
  }

  componentDidUpdate({ chart: oldChart }: ChartWrapperProps) {
    const { chart } = this.props;

    if (oldChart.key !== chart.key) {
      this.props.removeQueries(oldChart.series);
      this.props.addQueries(chart.series);
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
