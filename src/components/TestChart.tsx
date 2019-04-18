import React, { Component } from 'react';
import ApexCharts from 'apexcharts';
import Chart from 'react-apexcharts';
import { ChartSeries } from '../utils/charts';

interface TestChartProps {
  series: ChartSeries;
}

/**
 * Creates options for the Apex chart. Receives a list of categories for the
 * xaxis which should correspond to the year.
 */
const chartOptions = (categories: number[]): ApexCharts.ApexOptions => ({
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
    title: { text: 'Year' }
  },
  yaxis: {
    labels: {
      formatter: val => `${(val / 1000000000).toFixed(2)} MT`
    }
  }
});

export default class TestChart extends Component<TestChartProps> {
  render() {
    return (
      <Chart
        options={chartOptions(this.props.series.categories)}
        series={this.props.series.data}
        type="area"
        height="500"
      />
    );
  }
}
