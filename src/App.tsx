import React, { Component } from 'react';

import './App.sass';
import Main from './components/Main';

import { Provider } from 'react-redux';
import store from './store';

import DocumentTitle from 'react-document-title';

import LocaleContext, { TranslateFunc } from './utils/LocaleContext';
import idsFromPathname from './utils/idsFromPathname';
import translate from './utils/translate';
import selectLocale from './utils/selectLocale';

import nlTranslations from './data/locales/nl.json';
import enTranslations from './data/locales/en.json';

const curryTranslate = (messages: Record<string, string>) => {
  const curried: TranslateFunc = (id, values = {}) => {
    return translate(id, messages, values);
  };

  return curried;
};

const initialLocale = selectLocale(window.location.href, ['en', 'nl']);

class App extends Component {
  state = {
    currentLocale: initialLocale,
    translate: curryTranslate(
      initialLocale === 'en' ? enTranslations : nlTranslations
    )
  };

  constructor(props: {}) {
    super(props);
    this.setLocale = this.setLocale.bind(this);
  }

  render() {
    return (
      <Provider store={store}>
        <LocaleContext.Provider
          value={{ ...this.state, setLocale: this.setLocale }}
        >
          <DocumentTitle title={this.state.translate('app.title')}>
            <div className="App">
              <Main scenarioIDs={idsFromPathname(window.location.pathname)} />
            </div>
          </DocumentTitle>
        </LocaleContext.Provider>
      </Provider>
    );
  }

  setLocale(id: string) {
    let currentLocale = 'nl';
    let messages = nlTranslations;

    if (id === 'en') {
      currentLocale = 'en';
      messages = enTranslations;
    }

    window.localStorage.setItem('selected-locale', currentLocale);

    this.setState({ currentLocale, translate: curryTranslate(messages) });
  }
}

export default App;
