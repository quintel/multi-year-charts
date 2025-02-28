import Head from 'next/head';
import Balancer from 'react-wrap-balancer';
import Loading from '../components/Loading';

import { useSession, signIn, signOut } from 'next-auth/react';

import LocaleMessage from '../components/LocaleMessage';

const MissingScenarios = () => {
  const { data: session } = useSession();

  setTimeout(() => {
    const loader = document.getElementById('overlay-wait');
    if (loader) { loader.remove(); }
  }, 3000)

  return (
    <div>
      <Head>
        <title>
          <LocaleMessage id="app.title" />
        </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div id="overlay-wait" className="absolute flex top-0 left-0 h-screen w-screen bg-gray-100">
        <div className='my-auto mx-auto text-gray-400'>
          <Loading />
        </div>
      </div>

      <div className="flex h-screen items-center justify-center bg-gray-100 text-gray-700">
        <div className="w-[36rem] rounded-md bg-white p-16 text-center shadow-xl">
          <h1 className="mb-4 flex items-center justify-center text-2xl font-semibold tracking-tight">
            <LocaleMessage id="missingScenarios.title" />
          </h1>
          <p className="text-gray-500">
            <Balancer>
              <LocaleMessage id="missingScenarios.explanation" />
            </Balancer>
          </p>
          {!session && (
            <p className="mt-4 text-gray-500">
              <Balancer>
                <LocaleMessage id="missingScenarios.signInPrompt" />
              </Balancer>
            </p>
          )}
          <div className="mt-8 flex justify-center gap-4">
            <a
              href={`${process.env.NEXT_PUBLIC_MYETM_URL}/collections`}
              className="rounded-md bg-midnight-500 px-3.5 py-2 font-medium text-white transition hover:bg-midnight-600 active:bg-midnight-700"
            >
              ← <LocaleMessage id="app.backToETM" />
            </a>

            {session ? (
              <button
                onClick={() => signOut()}
                className="rounded-md bg-gray-200 px-3.5 py-2 font-medium text-gray-600 transition hover:bg-gray-300 hover:text-gray-700 active:bg-gray-350 active:text-gray-800"
              >
                <LocaleMessage id="session.signOut" />
                &hellip;
              </button>
            ) : (
              <button
                onClick={() => signIn('identity')}
                className="rounded-md bg-emerald-600 px-3.5 py-2 font-medium text-white transition hover:bg-emerald-700 active:bg-emerald-800"
              >
                <LocaleMessage id="session.signIn" />
                &hellip;
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissingScenarios;
