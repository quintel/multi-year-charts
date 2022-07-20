import React, { useContext } from 'react';
import dynamic from 'next/dynamic';

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

import { ChartSeries, translateChartData } from '../utils/charts';
import { UnitFormatter } from '../utils/units';

import { namespacedTranslate } from '../utils/translate';

import LocaleContext, { TranslateFunc } from '../utils/LocaleContext';

export interface ChartProps {
  series: ChartSeries;
}

/**
 * Creates options for the Apex chart. Receives a list of categories for the
 * xaxis which should correspond to the year.
 */
const chartOptions = (
  categories: number[],
  formatter: UnitFormatter,
  translate: TranslateFunc
): ApexCharts.ApexOptions => ({
  chart: {
    stacked: true,
    animations: {
      enabled: false,
    },
    brush: { enabled: false },
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  dataLabels: { enabled: false },
  stroke: {
    curve: 'straight',
    width: 2,
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      inverseColors: false,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [20, 100, 100, 100],
    },
  },
  tooltip: { x: { format: 'yyyy' } },
  xaxis: {
    type: 'datetime',
    categories: categories.map((year) => new Date(year, 1, 1).getTime()),
    tickAmount: categories[categories.length - 1] - categories[0],
    axisBorder: { show: false },
    axisTicks: { offsetX: -1, color: '#cfd4d9' },
    title: { text: translate('misc.year') },
    labels: {
      showDuplicates: false,
      offsetX: -1,
      formatter: (val, timestamp) => {
        const year = new Date(timestamp as number).getFullYear();

        if (categories.indexOf(year) !== -1) {
          // Only label years for which we have data.
          return year.toString();
        }

        return '';
      },
    },
  },
  yaxis: {
    labels: {
      formatter,
    },
  },
});

const Chart = (props: ChartProps) => {
  const { translate } = useContext(LocaleContext);

  return (
    <ApexChart
      options={chartOptions(props.series.categories, props.series.formatter, translate)}
      series={translateChartData(props.series, namespacedTranslate(translate, 'series')).data}
      type="area"
      height="600"
    />
  );
};

export default Chart;
