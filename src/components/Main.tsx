import React, { Component } from 'react';
import { connect } from 'react-redux';

import charts from '../data/charts';
import { ScenarioIndexedScenarioData } from '../utils/api/types';
import { ScenarioIDData } from '../store/types';

import { apiFetch, setScenarios } from '../store/actions';

import ChartContainer from './ChartContainer';
import InputsSummary from './InputsSummary';
import MainNav from './MainNav';
import ScenarioEditor from './ScenarioEditor';

const scenarios: ScenarioIDData[] = [
  { year: 2020, id: 403896 },
  { year: 2030, id: 403897 },
  { year: 2040, id: 403898 },
  { year: 2050, id: 403862 }
];

interface MainProps {
  setScenarios: (scenarios: ScenarioIDData[]) => {};
  apiFetch: () => {};
}

interface MainState {
  ready: boolean;
  scenarios: ScenarioIndexedScenarioData;
}

class Main extends Component<MainProps, MainState> {
  constructor(props: MainProps) {
    super(props);

    this.state = {
      ready: false,
      scenarios: []
    };
  }

  componentWillMount() {
    this.props.setScenarios(scenarios);
  }

  componentDidMount() {
    this.props.apiFetch();
  }

  render() {
    return (
      <div>
        <MainNav />
        <ChartContainer charts={charts} />
        <InputsSummary />
      </div>
    );
  }
}

export default connect(
  null,
  { apiFetch, setScenarios }
)(Main);
