import type { NextPage } from 'next';
import Head from 'next/head';

import InputsSummary from './InputsSummary/InputsSummary';
import WithCollection from './WithCollection';
import pageGutter from './pageGutter';
import useTranslate from '../utils/useTranslate';

const InputsPage: NextPage = () => {
  const translate = useTranslate();

  return (
    <WithCollection>
      <div>
        <Head>
          <title>
            {translate('app.inputs')} - {translate('app.title')}
          </title>
          <link rel="icon" href="/favicon.svg" />
        </Head>

        <div className={`${pageGutter} my-6`}>
          <InputsSummary />
        </div>
      </div>
    </WithCollection>
  );
};

export default InputsPage;
