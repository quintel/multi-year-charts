import React, { Component } from 'react';
import { connect } from 'react-redux';

import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom';

import charts from '../data/charts';
import { ScenarioIndexedScenarioData } from '../utils/api/types';

import { setScenarios } from '../store/actions';

import ChartContainer from './ChartContainer';
import InputsSummary from './InputsSummary';
import MainNav from './MainNav';
import SubNav from './SubNav';

interface MainProps {
  scenarioIDs: number[];
  setScenarios: (scenarios: number[]) => void;
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
    this.props.setScenarios(this.props.scenarioIDs);
  }

  render() {
    return (
      <div>
        <Router basename={`/${this.props.scenarioIDs.join(',')}`}>
          <MainNav />
          <SubNav charts={charts} />
          <div>
            <Route
              path="/"
              exact
              render={() => <Redirect to={`/charts/${charts[0].slug}`} />}
            />
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
