import type { NextPage } from 'next';
import Head from 'next/head';

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex h-screen w-full flex-wrap items-center justify-center text-gray-700">
        <div>
          <div className="w-[32rem] rounded-md bg-white p-12 shadow ring-1 ring-black/5">
            <h1 className="mb-4 flex items-center text-xl font-medium">
              Please select a scenario&hellip;
            </h1>
            <p>
              To use the Transition Path Charts tool, you must first select a scenario in the Energy
              Transition Model.
            </p>
            <p className="mt-4">
              <a href="#" className="-m-3 p-3 font-medium text-emerald-600 hover:text-emerald-800">
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
