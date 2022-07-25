import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

import ChartWrapper from '../../../../components/ChartWrapper/ChartWrapper';
import WithScenarios from '../../../../components/WithScenarios';
import { flattenChart } from '../../../../utils/charts';
import useTranslate from '../../../../utils/useTranslate';

import charts from '../../../../data/charts';
import { ChartSchema } from '../../../../data/charts';

function findChart(activeChart?: string): ChartSchema {
  let chart;

  if (activeChart) {
    chart = charts.find((chart) => chart.slug === activeChart);
  }

  return chart || charts[0];
}

function pageTitle(chart: ReturnType<typeof flattenChart>, t: ReturnType<typeof useTranslate>) {
  const chartKey = `chart.${chart.chartKey}`;
  const variantKey = `chart.variant.${chart.variantKey}`;

  if (chart.numVariants > 1) {
    return `${t(chartKey)} (${t(variantKey)})`;
  }

  return t(chartKey);
}

const ChartPage: NextPage = () => {
  const router = useRouter();
  const translate = useTranslate();

  const chartSlug = [router.query.chartSlug].flat()[0];
  const variantSlug = [router.query.variantSlug].flat()[0];

  if (!chartSlug) {
    return <div>Invalid URL</div>;
  }

  const chart = findChart(chartSlug);

  if (chart.variants.length > 1 && !variantSlug) {
    router.replace(`/charts/${chart.slug}/${chart.variants[0].slug}`);
  }

  const flattened = flattenChart(chart, variantSlug);

  return (
    <WithScenarios>
      <Head>
        <title>
          {pageTitle(flattened, translate)} - {translate('app.title')}
        </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ChartWrapper chart={flattened} />
    </WithScenarios>
  );
};

export default ChartPage;
