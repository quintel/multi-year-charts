import { useEffect, useState } from 'react';

import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import { Provider } from 'react-redux';

import MainNav from '../components/MainNav';
import SubNav from '../components/SubNav';

import store from '../store';
import LocaleContext, { TranslateFunc } from '../utils/LocaleContext';
import translate from '../utils/translate';
import selectLocale from '../utils/selectLocale';

import charts from '../data/charts';

import nlTranslations from '../data/locales/nl.json';
import enTranslations from '../data/locales/en.json';

import '../styles/globals.css';

const curryTranslate = (messages: Record<string, string>) => {
  const curried: TranslateFunc = (id: string, values = {}) => {
    return translate(id, messages, values);
  };

  return curried;
};

/**
 * Given the window pathname, extracts the list of scenario IDs to be shown in
 * the interface.
 */
const scenarioIDsFromQuery = (queryIDs: string): number[] => {
  const ids = queryIDs.split(',').map((id) => parseInt(id, 10));

  if (ids.some(isNaN)) {
    return [];
  }

  return ids;
};

function App({ Component, pageProps }: AppProps) {
  const initialLocale = selectLocale(window.location.href, ['en', 'nl']);

  const [locale, setLocale] = useState(initialLocale);

  const [translate, setTranslate] = useState<TranslateFunc>(
    curryTranslate(initialLocale === 'en' ? enTranslations : nlTranslations)
  );

  const onSetLocale = (id: string) => {
    let currentLocale = 'nl';
    let messages = nlTranslations;

    if (id === 'en') {
      currentLocale = 'en';
      messages = enTranslations;
    }

    window.localStorage.setItem('selected-locale', currentLocale);

    setLocale(currentLocale);
    setTranslate(curryTranslate(messages));
  };

  return (
    <Provider store={store}>
      <LocaleContext.Provider
        value={{
          translate:
            translate || curryTranslate(initialLocale === 'en' ? enTranslations : nlTranslations),
          currentLocale: locale,
          setLocale: onSetLocale,
        }}
      >
        <MainNav />
        <SubNav charts={charts} />
        <Component {...pageProps} />
      </LocaleContext.Provider>
    </Provider>
  );
}

export default dynamic(() => Promise.resolve(App), { ssr: false });
