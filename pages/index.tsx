import type { NextPage } from 'next';

import LocaleMessage from '../components/LocaleMessage';
import ErrorPage from '../components/ErrorPage';

const Home: NextPage = () => {
  return (
    <ErrorPage title={<LocaleMessage id="index.title" />}>
      <p className="text-gray-500">
        <LocaleMessage id="index.explanation" />
      </p>
      <p className="mt-4">
        <a
          href={`${process.env.NEXT_PUBLIC_MYETM_URL}/collections`}
          className="-m-3 p-3 font-medium text-emerald-600 hover:text-emerald-800"
        >
          <LocaleMessage id="index.selectScenario" /> →
        </a>
      </p>
    </ErrorPage>
  );
};

export default Home;
