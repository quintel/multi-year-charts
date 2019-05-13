import React, { Component } from 'react';
import { connect } from 'react-redux';

import { BrowserRouter as Router, Route } from 'react-router-dom';

import charts from '../data/charts';
import { ScenarioIndexedScenarioData } from '../utils/api/types';

import { setScenarios } from '../store/actions';

import ChartContainer from './ChartContainer';
import ExternalRedirect from './ExternalRedirect';
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
              render={() => (
                <ExternalRedirect
                  to={`${process.env.REACT_APP_ETMODEL_URL}/multi-year-charts`}
                />
              )}
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
