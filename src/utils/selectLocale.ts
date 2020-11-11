const findLocale = (wants: string[], allowed: string[]) => {
  return wants.find(locale => allowed.indexOf(locale) !== -1);
};

const defaultLocale = (allowed: string[]) => {
  const wants = [
    window.localStorage.getItem('selected-locale') || '_',
    ...(window.navigator.languages || [])
  ];

  return findLocale(wants, allowed) || 'nl';
};

/**
 * Selects the locale to be used. Uses the following order:
 *
 * 1. A "locale" search param.
 * 2. An previous locale preference selected using LocaleSwitcher.
 * 3. The user agent languages setting.
 * 4. "nl" is the final fallback.
 *
 * @param {string} params The current URL.
 * @param {string[]} allowed The list of locales which may be selected.
 */
const selectLocale = (params: string, allowed: string[]) => {
  const url = new URL(params);

  return (
    findLocale([url.searchParams.get('locale') || '_'], allowed) ||
    defaultLocale(allowed)
  );
};

export default selectLocale;
