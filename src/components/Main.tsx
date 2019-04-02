import React, { Component } from 'react';

import finalDemandSchema from '../data/charts/finalDemand';
import { ScenarioJSON, requestScenario } from '../utils/api';

const scenarios = [
  { year: 2020, id: 403896 },
  { year: 2030, id: 403897 },
  { year: 2040, id: 403898 },
  { year: 2050, id: 403862 }
];

interface MainState {
  ready: boolean;
  scenarios: ScenarioJSON[];
}

const fetchQueriesForScenarios = (
  scenarioIDs: number[]
): Promise<ScenarioJSON[]> => {
  return new Promise((resolve, reject) => {
    const responses = Promise.all(
      scenarioIDs.map(id => {
        return requestScenario(id, finalDemandSchema.series);
      })
    );

    responses.then(resolve).catch(reject);
  });
};

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
          {scenario.end_year}:{scenario.id} {series.join(' ')}
        </li>
      );
    });

    return (
      <div>
        <h1>Main:</h1>
        <ul>{data}</ul>
      </div>
    );
  }

  loadData() {
    fetchQueriesForScenarios(scenarios.map(({ id }) => id)).then(scenarios => {
      this.setState({
        ready: true,
        scenarios: scenarios
      });
    });
  }
}
