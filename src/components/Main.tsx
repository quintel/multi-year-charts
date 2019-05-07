import React, { Component } from 'react';
import { connect } from 'react-redux';

import { BrowserRouter as Router, Route } from 'react-router-dom';

import charts from '../data/charts';
import { ScenarioIndexedScenarioData } from '../utils/api/types';

import { setScenarios } from '../store/actions';

import ChartContainer from './ChartContainer';
import InputsSummary from './InputsSummary';
import MainNav from './MainNav';
import SubNav from './SubNav';

const scenarios = [403896, 403897, 403898, 403862];

interface MainProps {
  setScenarios: (scenarios: number[]) => {};
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

  render() {
    return (
      <div>
        <Router>
          <MainNav />
          <SubNav charts={charts} />
          <div>
            <Route path="/" exact component={ChartContainer} />
            <Route
              path="/charts/:slug"
              render={props => (
                <ChartContainer
                  activeChart={props.match.params.slug}
                  charts={charts}
                />
              )}
            />
            <Route path="/inputs" component={InputsSummary} />
          </div>
        </Router>
      </div>
    );
  }
}

export default connect(
  null,
  { setScenarios }
)(Main);
