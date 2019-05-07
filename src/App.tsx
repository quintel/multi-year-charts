import React, { Component } from 'react';

import './App.sass';
import Main from './components/Main';

import { Provider } from 'react-redux';
import store from './store';

import idsFromPathname from './utils/idsFromPathname';

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div className="App">
          <Main scenarioIDs={idsFromPathname(window.location.pathname)} />
        </div>
      </Provider>
    );
  }
}

export default App;
