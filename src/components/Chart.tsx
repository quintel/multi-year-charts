import React, { useContext } from 'react';
import ApexCharts from 'apexcharts';
import ApexChart from 'react-apexcharts';
import { ChartSeries, translateChartData } from '../utils/charts';

import LocaleContext, { TranslateFunc } from '../utils/LocaleContext';

interface TestChartProps {
  series: ChartSeries;
}

type UnitFormatter = (val: number) => string;

const createUnitFormatter = (unit: string): UnitFormatter => {
  switch (unit) {
    case 'MJ':
      return val => `${(val / 1000000000).toFixed(2)} PJ`;
    case 'kg':
      // "kg" gqueries are for primary CO2 which wrongly return kg as the unit
      // when it should be MT.
      return val => `${val.toFixed(2)} MT`;
    case 'tonne':
      return val => `${(val / 1000000).toFixed(2)} MT`;
    default:
      return val => `${val.toFixed(2)} ${unit}`;
  }
};

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

const Chart = (props: TestChartProps) => {
  const { translate } = useContext(LocaleContext);

  return (
    <ApexChart
      options={chartOptions(
        props.series.categories,
        createUnitFormatter(props.series.unit),
        translate
      )}
      series={
        translateChartData(props.series, (key: string) =>
          translate(`series.${key}`)
        ).data
      }
      type="area"
      height="500"
    />
  );
};

export default Chart;
