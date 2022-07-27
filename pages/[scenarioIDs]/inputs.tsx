import type { NextPage } from 'next';
import Head from 'next/head';

import Chrome from '../../components/Chrome';
import InputsSummary from '../../components/InputsSummary/InputsSummary';
import WithScenarios from '../../components/WithScenarios';
import useTranslate from '../../utils/useTranslate';

const Inputs: NextPage = () => {
  const translate = useTranslate();

  return (
    <Chrome>
      <WithScenarios>
        <div>
          <Head>
            <title>
              {translate('app.sliderSettings')} - {translate('app.title')}
            </title>
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <div className="container mx-auto my-6">
            <InputsSummary />
          </div>
        </div>
      </WithScenarios>
    </Chrome>
  );
};

export default Inputs;
