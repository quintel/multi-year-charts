import { useEffect } from 'react';
import { useRouter } from 'next/router';

import ChartWrapper from './ChartWrapper';

import { ChartSchema } from '../data/charts';
import { flattenChart } from '../utils/charts';

interface ChartContainerProps {
  charts: ChartSchema[];
  activeChart?: string;
  activeVariant?: string;
}

function findChart(charts: ChartSchema[], activeChart?: string): ChartSchema {
  let chart;

  if (activeChart) {
    chart = charts.find((chart) => chart.slug === activeChart);
  }

  return chart || charts[0];
}

/**
 * The main component which displays the available chart types, and renders the
 * selected chart.
 */
export default function ChartContainer({
  activeChart,
  activeVariant,
  charts,
}: ChartContainerProps) {
  const router = useRouter();
  const chart = findChart(charts, activeChart);

  useEffect(() => {
    // Redirect to the first variant if no variant is selected.
    if (chart.variants.length > 1 && !activeVariant) {
      router.push(`/charts/${chart.slug}/${chart.variants[0].slug}`);
    }
  }, [activeVariant, chart, router]);

  return <ChartWrapper chart={flattenChart(chart, activeVariant)} />;
}
