import { useState, useEffect } from 'react';

import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';

import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';

import store from '../store';
import LocaleContext, { TranslateFunc } from '../utils/LocaleContext';
import translate from '../utils/translate';
import selectLocale from '../utils/selectLocale';
import useSessionKeeper from '../utils/useSessionKeeper';

import nlTranslations from '../data/locales/nl.json';
import enTranslations from '../data/locales/en.json';

import '../styles/globals.css';
import '@fontsource-variable/montserrat';

// Every antd component is themed here
const antTheme = {
  token: { fontFamily: 'inherit' },
  components: {
    Breadcrumb: {
      fontSize: 20,
      fontHeight: 30,
      itemColor: '#4b5563',
      lastItemColor: '#1f2937',
    },
    Table: {
      cellPaddingBlockSM: 8,
      cellPaddingInlineSM: 8,
      borderColor: '#d1d5db',
      headerBg: 'transparent',
      headerSplitColor: 'transparent',
      rowHoverBg: 'transparent',
      headerBorderRadius: 0,
    },
  },
};

const curryTranslate = (messages: Record<string, string>) => {
  const curried: TranslateFunc = (id: string, values = {}) => {
    return translate(id, messages, values);
  };

  return curried;
};

function App({ Component, pageProps }: AppProps) {
  useSessionKeeper();

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

  // The shared HttpOnly session cookie is the session: no SessionProvider or silent-SSO probe.
  return (
    <Provider store={store}>
      <ConfigProvider theme={antTheme}>
        <LocaleContext.Provider
          value={{
            translate:
              translate || curryTranslate(initialLocale === 'en' ? enTranslations : nlTranslations),
            currentLocale: locale,
            setLocale: onSetLocale,
          }}
        >
          <Component {...pageProps} unit={unit} />
        </LocaleContext.Provider>
      </ConfigProvider>
    </Provider>
  );
}

export default dynamic(() => Promise.resolve(App), { ssr: false });
