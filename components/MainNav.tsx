import { useContext } from 'react';

import { PresentationChartLineIcon } from '@heroicons/react/outline';
import { ArrowSmLeftIcon } from '@heroicons/react/solid';

import LocaleContext from '../utils/LocaleContext';
import LocaleMessage from './LocaleMessage';
import LocaleSwitcher from './LocaleSwitcher';
import SessionInformation from './SessionInformation';

const MainNav = () => {
  const { currentLocale, setLocale } = useContext(LocaleContext);

  return (
    <nav
      id="main-nav"
      className="bg-nav text-gray-100"
      role="navigation"
      aria-label="main navigation"
    >
      <div className="container mx-auto flex items-stretch gap-3 py-3">
        <div className="mr-auto flex items-center font-semibold">
          <PresentationChartLineIcon className="mr-1.5 -ml-1 h-6 w-6" />
          <LocaleMessage id="app.title" />
          <span className="ml-1.5 mt-1 text-xs font-normal">
            <LocaleMessage id="app.by_the" />{' '}
            <a className="transition hover:text-gray-800" href={process.env.NEXT_PUBLIC_ETMODEL_URL}>
              <LocaleMessage id="app.etm" />
            </a>
          </span>
        </div>

        <SessionInformation />
        <LocaleSwitcher currentLocale={currentLocale} setLocale={setLocale} />
        <a
          className="inline-flex items-center rounded bg-banner px-3 py-1 pl-1.5 text-xs font-medium text-gray-800 shadow transition hover:bg-white active:bg-tyndp-light-blue active:shadow-inner"
          href={process.env.NEXT_PUBLIC_ETMODEL_URL}
        >
          <ArrowSmLeftIcon className="mr-1 h-5 w-5" />
          <LocaleMessage id="app.backToETM" />
        </a>
      </div>
    </nav>
  );
};

export default MainNav;
