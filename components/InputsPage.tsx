import type { NextPage } from 'next';
import Head from 'next/head';
import { useSelector } from 'react-redux';

import InputsSummary from './InputsSummary/InputsSummary';
import WithCollection from './WithCollection';
import pageGutter from './pageGutter';
import useTranslate from '../utils/useTranslate';
import { AppState } from '../store/types';

const InputsPage: NextPage = () => {
  const translate = useTranslate();
  const collectionTitle = useSelector((state: AppState) => state.collection.title);

  return (
    <WithCollection>
      <div>
        <Head>
          <title>
            {[translate('app.inputs'), collectionTitle, translate('app.title')]
              .filter(Boolean)
              .join(' - ')}
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
