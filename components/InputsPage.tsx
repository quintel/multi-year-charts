import type { NextPage } from 'next';
import Head from 'next/head';

import InputsSummary from './InputsSummary/InputsSummary';
import WithCollection from './WithCollection';
import useTranslate from '../utils/useTranslate';

const InputsPage: NextPage = () => {
  const translate = useTranslate();

  return (
    <WithCollection>
      <div>
        <Head>
          <title>
            {translate('app.sliderSettings')} - {translate('app.title')}
          </title>
          <link rel="icon" href="/favicon.svg" />
        </Head>

        <div className="container mx-auto my-6">
          <InputsSummary />
        </div>
      </div>
    </WithCollection>
  );
};

export default InputsPage;
