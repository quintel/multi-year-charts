import React from 'react';

export type TranslateFunc = (id: string, values?: Record<string, string>) => string;

const LocaleContext = React.createContext({
  currentLocale: 'nl',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setLocale: (id: string) => {
    // stub function; real function is assigned in App.tsx
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  translate: (id: string, values: Record<string, string> = {}) => id
});

export default LocaleContext;
