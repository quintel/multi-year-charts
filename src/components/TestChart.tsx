import React, { Component } from 'react';
import ApexCharts from 'apexcharts';
import Chart from 'react-apexcharts';
import { ChartSeries, translateChartData } from '../utils/charts';

import translate from '../utils/translate';
import translations from '../data/locales/nl.json';

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
  formatter: UnitFormatter
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
    curve: 'smooth',
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
    title: { text: translate('misc.year', translations) }
  },
  yaxis: {
    labels: {
      formatter
    }
  }
});

export default class TestChart extends Component<TestChartProps> {
  render() {
    const translatedSeries = translateChartData(
      this.props.series,
      (key: string) => translate(`series.${key}`, translations)
    );

    const options = chartOptions(
      this.props.series.categories,
      createUnitFormatter(this.props.series.unit)
    );

    return (
      <Chart
        options={options}
        series={translatedSeries.data}
        type="area"
        height="500"
      />
    );
  }
}
