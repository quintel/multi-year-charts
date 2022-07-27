import type { NextPage } from 'next';
import Head from 'next/head';

import LocaleMessage from '../components/LocaleMessage';
import LocaleSwitcher from '../components/LocaleSwitcher';

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>
          <LocaleMessage id="app.title" />
        </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex h-screen items-center justify-center text-gray-700">
        <div className="w-[32rem] rounded-md bg-gray-50 p-12 text-center">
          <h1 className="mb-4 flex items-center justify-center text-xl font-medium">
            <LocaleMessage id="index.title" />
            &hellip;
          </h1>
          <p className="text-gray-500">
            <LocaleMessage id="index.explanation" />
          </p>
          <p className="mt-4">
            <a
              href={`${process.env.NEXT_PUBLIC_ETMODEL_URL}/multi_year_charts`}
              className="-m-3 p-3 font-medium text-emerald-600 hover:text-emerald-800"
            >
              <LocaleMessage id="index.selectScenario" /> →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
