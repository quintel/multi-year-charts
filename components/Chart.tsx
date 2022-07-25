import React, { useContext } from 'react';
import dynamic from 'next/dynamic';

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

import { ChartSeries, translateChartData } from '../utils/charts';
import { UnitFormatter } from '../utils/units';

import type { ChartStyle } from '../store/types';

import { namespacedTranslate } from '../utils/translate';
import LocaleContext, { TranslateFunc } from '../utils/LocaleContext';

export interface ChartProps {
  series: ChartSeries;
  style: Exclude<ChartStyle, 'table'>;
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
  // stroke: {
  //   curve: 'straight',
  //   width: 2
  // },
  // fill: {
  //   type: 'gradient',
  //   gradient: {
  //     shadeIntensity: 1,
  //     inverseColors: false,
  //     opacityFrom: 0.45,
  //     opacityTo: 0.05,
  //     stops: [20, 100, 100, 100]
  //   }
  // },
  tooltip: { x: { format: 'yyyy' } },
  xaxis: {
    // type: 'datetime',
    categories: categories.map((year) => new Date(year, 1, 1).getFullYear().toString()),
    tickAmount: categories[categories.length - 1] - categories[0],
    axisBorder: { show: false },
    axisTicks: { offsetX: -1, color: '#cfd4d9' },
    title: { text: translate('misc.year') },
    // labels: {
    //   showDuplicates: false,
    //   offsetX: -1,
    //   formatter: (val, timestamp) => {
    //     const year = new Date(timestamp).getFullYear();

    //     if (categories.indexOf(year) !== -1) {
    //       // Only label years for which we have data.
    //       return year.toString();
    //     }

    //     return '';
    //   }
    // }
  },
  yaxis: {
    labels: {
      formatter,
    },
  },
});

const areaChartOptions = (
  categories: number[],
  formatter: UnitFormatter,
  translate: TranslateFunc
): ApexCharts.ApexOptions => {
  const common = chartOptions(categories, formatter, translate);

  // In the line chart, the xaxis uses dates so that each year is positioned correctly.
  common.xaxis = {
    ...common.xaxis,
    type: 'datetime',
    categories: categories.map((year) => new Date(year, 1, 1).getTime()),
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
  };

  common.stroke = {
    curve: 'straight',
    width: 2,
  };

  common.fill = {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      inverseColors: false,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [20, 100, 100, 100],
    },
  };

  return common;
};

const Chart = (props: ChartProps) => {
  const { translate } = useContext(LocaleContext);

  const options =
    props.style === 'bar'
      ? chartOptions(props.series.categories, props.series.formatter, translate)
      : areaChartOptions(props.series.categories, props.series.formatter, translate);

  return (
    <ApexChart
      options={options}
      series={translateChartData(props.series, namespacedTranslate(translate, 'series')).data}
      type={props.style}
      height="600"
    />
  );
};

export default Chart;
