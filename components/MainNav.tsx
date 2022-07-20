import React, { useContext } from 'react';

import LocaleContext from '../utils/LocaleContext';
import LocaleMessage from './LocaleMessage';
import LocaleSwitcher from './LocaleSwitcher';

const MainNav = () => {
  const { currentLocale, setLocale } = useContext(LocaleContext);

  return (
    <nav
      id="main-nav"
      className="bg-slate-700 text-slate-100"
      role="navigation"
      aria-label="main navigation"
    >
      <div className="container mx-auto flex items-stretch gap-3 py-3">
        <div className="mr-auto flex items-center font-semibold">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mr-1.5 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
            />
          </svg>
          <LocaleMessage id="app.title" />
          <span className="ml-1.5 mt-1 text-xs font-normal text-slate-400">
            <LocaleMessage id="app.by_the" />{' '}
            <a className="transition hover:text-white" href={process.env.NEXT_PUBLIC_ETMODEL_URL}>
              <LocaleMessage id="app.etm" />
            </a>
          </span>
        </div>

        <LocaleSwitcher currentLocale={currentLocale} setLocale={setLocale} />
        <a
          className="inline-flex items-center rounded bg-emerald-600 bg-gradient-to-b from-white/20 to-transparent px-3 py-1 pl-1.5 text-xs font-medium text-white shadow transition hover:bg-emerald-500 active:bg-emerald-600 active:shadow-inner"
          href={process.env.NEXT_PUBLIC_ETMODEL_URL}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mr-1 h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          <LocaleMessage id="app.backToETM" />
        </a>
      </div>
    </nav>
  );
};

export default MainNav;
