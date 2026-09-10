import { useContext } from 'react';

import LocaleContext from '../utils/LocaleContext';
import LocaleMessage from './LocaleMessage';
import LocaleSwitcher from './LocaleSwitcher';
import SessionInformation from './SessionInformation';
import SessionTitle from './SessionTitle';
import pageGutter from './pageGutter';

const MainNav = () => {
  const { currentLocale, setLocale } = useContext(LocaleContext);

  return (
    <nav
      id="main-nav"
      className="bg-gray-700 text-gray-100"
      role="navigation"
      aria-label="main navigation"
    >
      <div className={`${pageGutter} flex items-center gap-3 py-3`}>
        <div className="flex flex-1 min-w-0 items-center justify-start">
          <div className="flex shrink-0 items-center font-semibold">
            <img src="/logo-round.svg" alt="" className="mr-1.5 h-8 w-8" />
            <LocaleMessage id="app.title" />
            <span className="ml-1.5 mt-0.5 text-xs font-normal text-gray-400">
              <LocaleMessage id="app.by_the" />{' '}
              <a className="transition hover:text-white" href={process.env.NEXT_PUBLIC_ETMODEL_URL}>
                <LocaleMessage id="app.etm" />
              </a>
            </span>
          </div>
        </div>
        <SessionTitle />
        <div className="flex flex-1 justify-end">
          <LocaleSwitcher currentLocale={currentLocale} setLocale={setLocale} />
          <SessionInformation />
        </div>
      </div>
    </nav>
  );
};

export default MainNav;
