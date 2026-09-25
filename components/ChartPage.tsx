import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';

import ChartWrapper from './ChartWrapper/ChartWrapper';
import WithCollection from './WithCollection';
import { flattenChart } from '../utils/charts';
import useTranslate from '../utils/useTranslate';
import useLinkHelper from '../utils/useLinkHelper';

import charts from '../data/charts';
import { ChartSchema } from '../data/charts';
import { AppState } from '../store/types';

function findChart(activeChart?: string): ChartSchema {
  let chart;

  if (activeChart) {
    chart = charts.find((chart) => chart.slug === activeChart);
  }

  return chart || charts[0];
}

function pageTitle(chart: ReturnType<typeof flattenChart>, t: ReturnType<typeof useTranslate>) {
  const chartLabel = t(`chart.${chart.chartKey}`);

  if (!chart.hasVariants) {
    return chartLabel;
  }

  const variantLabel = chart.variantPath.map((key) => t(`chart.variant.${key}`)).join(' - ');

  return `${chartLabel} (${variantLabel})`;
}

const ChartPage: NextPage = () => {
  const router = useRouter();
  const translate = useTranslate();
  const { linkTo } = useLinkHelper();
  const collectionTitle = useSelector((state: AppState) => state.collection.title);

  const chartSlug = [router.query.chartSlug].flat()[0];
  const variantSlugs = [router.query.variantSlug].flat().filter(Boolean) as string[];

  if (!chartSlug) {
    return <div>Invalid URL</div>;
  }

  const chart = findChart(chartSlug);
  const flattened = flattenChart(chart, variantSlugs);

  // Missing, incomplete, or invalid variant urls all resolve to a canonical path
  const currentPath = [chart.slug, ...variantSlugs].join('/');

  if (currentPath !== flattened.slug) {
    router.replace(linkTo(`/charts/${flattened.slug}`));
  }

  return (
    <WithCollection>
      <Head>
        <title>
          {[pageTitle(flattened, translate), collectionTitle, translate('app.title')]
            .filter(Boolean)
            .join(' - ')}
        </title>
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <ChartWrapper chart={flattened} />
    </WithCollection>
  );
};

export default ChartPage;
