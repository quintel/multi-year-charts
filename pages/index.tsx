import type { NextPage } from 'next';
import Head from 'next/head';

import ChartContainer from '../components/ChartContainer';

import charts from '../data/charts';

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="w-full flex-wrap h-screen flex items-center justify-center text-gray-700">
        <div>
          <div className="w-[32rem] bg-white p-12 shadow rounded-md ring-1 ring-black/5">
            <h1 className="font-medium text-xl mb-4 flex items-center">
              Please select a scenario&hellip;
            </h1>
            <p>
              To use the Transition Path Charts tool, you must first select a scenario in the Energy
              Transition Model.
            </p>
            <p className="mt-4">
              <a href="#" className="text-emerald-600 hover:text-emerald-800 font-medium p-3 -m-3">
                Select a scenario →
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
