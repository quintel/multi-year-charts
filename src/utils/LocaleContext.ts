import React from 'react';

export type TranslateFunc = (
  id: string,
  values?: Record<string, string>
) => string;

const LocaleContext = React.createContext({
  currentLocale: 'nl',
  setLocale: (id: string) => {},
  translate: (id: string, values: Record<string, string> = {}) => id
});

export default LocaleContext;
