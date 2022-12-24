import Head from 'next/head';
import LocaleMessage from '../components/LocaleMessage';

const ErrorPage = ({ children, title }: { children: React.ReactNode; title: React.ReactNode }) => {
  return (
    <div>
      <Head>
        <title>
          <LocaleMessage id="app.title" />
        </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex h-screen items-center justify-center bg-gray-100 text-gray-700">
        <div className="w-[36rem] rounded-md bg-white p-16 text-center shadow-xl">
          <h1 className="mb-4 flex items-center justify-center text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          {children}
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
