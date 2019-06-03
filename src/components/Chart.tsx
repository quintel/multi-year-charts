import React, { useContext } from 'react';
import ApexCharts from 'apexcharts';
import ApexChart from 'react-apexcharts';

import {
  ChartSeries,
  UnitFormatter,
  createUnitFormatter,
  translateChartData
} from '../utils/charts';

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
      speed: 350,
      animateGradually: { enabled: false }
    }
  },
  dataLabels: { enabled: false },
  stroke: {
    curve: 'straight',
    width: 2
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      inverseColors: false,
      opacityFrom: 0.45,
      opacityTo: 0.05,
      stops: [20, 100, 100, 100]
    }
  },
  xaxis: {
    type: 'categories',
    categories,
    title: { text: translate('misc.year') }
  },
  yaxis: {
    labels: {
      formatter
    }
  }
});

const Chart = (props: ChartProps) => {
  const { translate } = useContext(LocaleContext);

  return (
    <ApexChart
      options={chartOptions(
        props.series.categories,
        createUnitFormatter(props.series.unit),
        translate
      )}
      series={
        translateChartData(
          props.series,
          namespacedTranslate(translate, 'series')
        ).data
      }
      type="area"
      height="500"
    />
  );
};

export default Chart;
