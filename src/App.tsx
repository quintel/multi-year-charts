import React, { Component } from 'react';

import './App.sass';
import Main from './components/Main';

import { Provider } from 'react-redux';
import store from './store';

import LocaleContext, { TranslateFunc } from './utils/LocaleContext';
import idsFromPathname from './utils/idsFromPathname';
import translate from './utils/translate';

import nlTranslations from './data/locales/nl.json';
import enTranslations from './data/locales/en.json';

const curryTranslate = (messages: Record<string, string>) => {
  const curried: TranslateFunc = (id, values = {}) => {
    return translate(id, messages, values);
  };

  return curried;
};

const localeFromURL = (params: string) => {
  const url = new URL(params);
  return url.searchParams.get('locale') || 'nl';
};

const initialLocale = localeFromURL(window.location.href);

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
          <div className="App">
            <Main scenarioIDs={idsFromPathname(window.location.pathname)} />
          </div>
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

    this.setState({ currentLocale, translate: curryTranslate(messages) });
  }
}

export default App;
