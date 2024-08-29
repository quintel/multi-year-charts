import { useCallback, useRef, useState } from 'react';

import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';

import { BarChart, LineChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  SingleAxisComponent,
  TooltipComponent,
} from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';

import type { ChartStyle } from '../store/types';
import { ChartSeries, translateChartData } from '../utils/charts';

import { namespacedTranslate } from '../utils/translate';
import useTranslate from '../utils/useTranslate';
import EChartsReact from 'echarts-for-react';

// Register the echarts features.
echarts.use([
  BarChart,
  LineChart,
  GridComponent,
  LegendComponent,
  SingleAxisComponent,
  TooltipComponent,
  SVGRenderer,
]);

// Expanded colors array to support more series.
const colors = [
  '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272',
  '#fc8452', '#9a60b4', '#ea7ccc', '#c65470', '#75cc91', '#5858fa',
  '#66eecc', '#de7373', '#a23b72', '#52fc84', '#b49a60', '#cc7cea',
  '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272',
  '#fc8452', '#9a60b4', '#ea7ccc', '#c65470', '#75cc91', '#5858fa',
  '#66eecc', '#de7373', '#a23b72', '#52fc84', '#b49a60', '#cc7cea'
];

export interface ChartProps {
  series: ChartSeries;
  style: Exclude<ChartStyle, 'table'>;
}

/**
 * Renders a legend for the chart.
 *
 * We render a custom legend, rather than using the feature built in to Echarts as Echarts requires
 * that we create a fixed margin below the chart for the legend. This can result in too much white
 * space if the legend is short, and too little if it is long. Instead, we give the chart the full
 * available space and render the legend ourselves.
 */
function Legend({
  names,
  onItemClick,
  onItemMouseOver,
  onItemMouseOut,
  colors,
  hiddenSeries,
}: {
  names: string[];
  onItemClick: (key: string) => void;
  onItemMouseOver: (key: string) => void;
  onItemMouseOut: (key: string) => void;
  colors: string[];
  hiddenSeries: Record<string, boolean>;
}) {
  return (
    <div className="text-center text-sm">
      {names.map((name, i) => (
        <button
          className={`inline-flex items-center whitespace-nowrap py-0.5 px-1.5 transition-opacity ${
            hiddenSeries[name] ? 'opacity-40' : ''
          }`}
          key={i}
          onClick={() => onItemClick(name)}
          onMouseOut={() => onItemMouseOut(name)}
          onMouseOver={() => onItemMouseOver(name)}
          role="presentation"
        >
          <span
            className="mr-1 inline-block h-3.5 w-3.5 rounded-sm"
            style={{ backgroundColor: colors[i % colors.length] }}
          />
          {name}
        </button>
      ))}
    </div>
  );
}

const Chart = ({ series, style }: ChartProps) => {
  const echartRef = useRef<EChartsReact | null>(null);

  const translate = useTranslate();
  const translatedSeries = translateChartData(series, namespacedTranslate(translate, 'series'));

  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({});

  //  We may want to filter the series to remove those that have no data, but
  //  this is not currently working with the colour assignments in the legend and table.

  // const filteredSeries = translatedSeries.data
  // .map((cSeries) => ({
  //   ...cSeries,
  //   data: cSeries.data.filter((value) => value !== 0),
  // }))
  // .filter((cSeries) => cSeries.data.length > 0);

  const echartSeries = translatedSeries.data.map((cSeries, index) => {
    // const hasNonZeroValues = cSeries.data.some(value => value !== 0);

    return {
      name: cSeries.name,
      type: style === 'bar' ? 'bar' : 'line',
      stack: 'Total',
      areaStyle: {},
      itemStyle: {
        opacity: style === 'bar' ? 0.8 : 1,
        color: colors[index % colors.length],
      },
      emphasis: {
        focus: 'series',
      },
      data: cSeries.data,
    };
  });

  const options = {
    color: colors,
    animationDuration: 0,
    animationDurationUpdate: 300,
    tooltip: {
      trigger: 'axis',
      valueFormatter: series.formatter,
      transitionDuration: 0,
      axisPointer: {
        type: 'cross',
        lineStyle: {
          color: '#1f2937',
          opacity: 0.25,
        },
        crossStyle: {
          color: '#1f2937',
          opacity: 0.25,
        },
        label: {
          backgroundColor: '#6a7985',
          formatter: ({ axisDimension, value }: { axisDimension: 'x' | 'y'; value: number }) => {
            if (axisDimension === 'y') {
              return series.formatter(value).replace(/\.[^\s]*/, '');
            }

            return value;
          },
        },
      },
    },
    legend: {
      show: false,
      selected: translatedSeries.data.reduce(
        (rest, { name }) => ({ ...rest, [name]: !hiddenSeries[name] }),
        {}
      ),
    },
    grid: {
      top: '5%',
      left: '0%',
      right: '2%',
      bottom: '0%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: style === 'bar',
        data: series.categories,
        axisLabel: { fontSize: 14 },
      },
    ],
    yAxis: [
      {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => {
            const [numericPart, unitPart] = series.formatter(value).split(' ');
            const roundedNumericPart = Math.round(parseFloat(numericPart));

            if (roundedNumericPart % 10 !== 0) {
              return `${roundedNumericPart} ${unitPart}`;
            }

            return `${Math.round(roundedNumericPart / 10) * 10} ${unitPart}`;
          },
          fontSize: 14,
        },
      },
    ],
    series: echartSeries,
  };


  const onLegendItemClick = useCallback((key: string) => {
    if (!echartRef.current) {
      return;
    }

    const instance = echartRef.current.getEchartsInstance();

    const legend = instance.getOption().legend as any;
    const selected = legend?.[0].selected || {};

    instance.setOption({
      legend: { selected: { [key]: !selected[key] } },
    });

    setHiddenSeries((prev) => ({ ...prev, [key]: !prev[key] }));
    instance.dispatchAction({ type: 'highlight', seriesName: key });
  }, []);

  const onLegendItemMouseOver = useCallback((key: string) => {
    if (!echartRef.current) {
      return;
    }

    const instance = echartRef.current.getEchartsInstance();
    instance.dispatchAction({ type: 'highlight', seriesName: key });
  }, []);

  const onLegendItemMouseOut = useCallback((key: string) => {
    if (!echartRef.current) {
      return;
    }

    const instance = echartRef.current.getEchartsInstance();

    // We have to set the series as highlighted, as ECharts sometimes gets confused after clicking
    // to show or hide the item and treats the series as it it was not highlighted.
    instance.dispatchAction({ type: 'highlight', seriesName: key });
    instance.dispatchAction({ type: 'downplay', seriesName: key });
  }, []);

  return (
    <div>
      <ReactEChartsCore
        echarts={echarts}
        ref={echartRef}
        notMerge
        option={options}
        style={{ height: '500px' }}
      />
      <div className="mx-24 pt-4">
        <Legend
          names={translatedSeries.data.map(({ name }) => name)}
          onItemClick={onLegendItemClick}
          onItemMouseOver={onLegendItemMouseOver}
          onItemMouseOut={onLegendItemMouseOut}
          colors={colors}
          hiddenSeries={hiddenSeries}
        />
      </div>
    </div>
  );
};

export default Chart;
