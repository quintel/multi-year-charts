import { useContext } from 'react';
import { useSession } from 'next-auth/react';

import { PresentationChartLineIcon } from '@heroicons/react/outline';
import { ArrowSmLeftIcon } from '@heroicons/react/solid';

import LocaleContext from '../utils/LocaleContext';
import LocaleMessage from './LocaleMessage';
import LocaleSwitcher from './LocaleSwitcher';
import SessionInformation from './SessionInformation';

const MainNav = () => {
  const { currentLocale, setLocale } = useContext(LocaleContext);
  const { data: session } = useSession();

  // Determine the URL based on session
  const etmUrl = session
  ? `${process.env.NEXT_PUBLIC_MYETM_URL}/collections`  // Authenticated
  : `${process.env.NEXT_PUBLIC_ETMODEL_URL}`;           // Default

  return (
    <nav
      id="main-nav"
      className="bg-gray-700 text-gray-100"
      role="navigation"
      aria-label="main navigation"
    >
      <div className="container mx-auto flex items-stretch gap-3 py-3">
        <div className="mr-auto flex items-center font-semibold">
          <PresentationChartLineIcon className="mr-1.5 -ml-1 h-6 w-6" />
          <LocaleMessage id="app.title" />
          <span className="text-gray-400 text-sm">#2025.01</span>
          <span className="ml-1.5 mt-1 text-xs font-normal text-gray-400">
            <LocaleMessage id="app.by_the" />{' '}
            <a className="transition hover:text-white" href={process.env.NEXT_PUBLIC_ETMODEL_URL}>
              <LocaleMessage id="app.etm" />
            </a>
          </span>
        </div>

        <SessionInformation />
        <LocaleSwitcher currentLocale={currentLocale} setLocale={setLocale} />
        <a
          className="inline-flex items-center rounded bg-emerald-600 bg-gradient-to-b from-white/20 to-transparent px-3 py-1 pl-1.5 text-xs font-medium text-white shadow transition hover:bg-emerald-500 active:bg-emerald-600 active:shadow-inner"
          href={etmUrl}
        >
          <ArrowSmLeftIcon className="mr-1 h-5 w-5" />
          <LocaleMessage id="app.backToETM" />
        </a>
      </div>
    </nav>
  );
};

export default MainNav;
