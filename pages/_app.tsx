import { useState, useEffect } from 'react';

import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';

import { SessionProvider } from 'next-auth/react';

import { Provider } from 'react-redux';

import store from '../store';
import LocaleContext, { TranslateFunc } from '../utils/LocaleContext';
import translate from '../utils/translate';
import selectLocale from '../utils/selectLocale';

import TrySignIn from '../components/TrySignIn';

import nlTranslations from '../data/locales/nl.json';
import enTranslations from '../data/locales/en.json';

import '../styles/globals.css';
import '@fontsource/inter/variable.css';

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

  const [unit, setUnit] = useState<'J' | 'Wh'>(() => {
    return (localStorage.getItem('defaultUnit') as 'J' | 'Wh') || 'J';
  });

  useEffect(() => {
    const handleUnitChange = () => {
      const updatedUnit = localStorage.getItem('defaultUnit') as 'J' | 'Wh';
      setUnit(updatedUnit);
    };

    window.addEventListener('unitChange', handleUnitChange);

    return () => {
      window.removeEventListener('unitChange', handleUnitChange);
    };
  }, []);

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

  // get from params if with current user to do: localStorage.removeItem('stop-login-attempt');
  return (
    <SessionProvider session={pageProps.session}>
      <TrySignIn>
        <Provider store={store}>
          <LocaleContext.Provider
            value={{
              translate:
                translate ||
                curryTranslate(initialLocale === 'en' ? enTranslations : nlTranslations),
              currentLocale: locale,
              setLocale: onSetLocale,
            }}
          >
            <Component {...pageProps} unit={unit} />
          </LocaleContext.Provider>
        </Provider>
      </TrySignIn>
    </SessionProvider>
  );
}

export default dynamic(() => Promise.resolve(App), { ssr: false });
