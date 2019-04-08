import React, { Component } from 'react';

import finalDemandSchema from '../data/charts/finalDemand';
import { ScenarioData, fetchQueriesForScenarios } from '../utils/api';
import { scenariosToChartData } from '../utils/charts';

import TestChart from './TestChart';

const scenarios = [
  { year: 2020, id: 403896 },
  { year: 2030, id: 403897 },
  { year: 2040, id: 403898 },
  { year: 2050, id: 403862 }
];

interface MainState {
  ready: boolean;
  scenarios: ScenarioData[];
}

export default class Main extends Component<{}, MainState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      ready: false,
      scenarios: []
    };
  }

  componentDidMount() {
    this.loadData();
  }

  render() {
    if (!this.state.ready) {
      return <h1>Main (not ready)</h1>;
    }

    const data = this.state.scenarios.map(({ scenario, gqueries }) => {
      const series = finalDemandSchema.series.map(
        serie => `${serie}=${gqueries[serie].future}`
      );

      return (
        <li key={`scenario-${scenario.id}`}>
          {scenario.endYear}:{scenario.id} {series.join(' ')}
        </li>
      );
    });

    return (
      <div>
        <h1>Main:</h1>
        <ul>{data}</ul>
        <TestChart
          series={scenariosToChartData(
            this.state.scenarios,
            finalDemandSchema.series
          )}
        />
      </div>
    );
  }

  loadData() {
    fetchQueriesForScenarios(
      scenarios.map(({ id }) => id),
      finalDemandSchema.series
    ).then(scenarios => {
      this.setState({
        ready: true,
        scenarios: scenarios
      });
    });
  }
}
