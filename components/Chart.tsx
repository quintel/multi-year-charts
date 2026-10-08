import { forwardRef, useCallback, useId, useImperativeHandle, useMemo, useRef, useState, useEffect } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  SingleAxisComponent,
  TooltipComponent,
} from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';

import { ChartSeries, translateChartData } from '../utils/charts';
import { chartColors as colors } from '../utils/chartColors';
import { namespacedTranslate } from '../utils/translate';
import useTranslate from '../utils/useTranslate';
import EChartsReact from 'echarts-for-react';

// Register the echarts features.
echarts.use([
  BarChart,
  GridComponent,
  LegendComponent,
  SingleAxisComponent,
  TooltipComponent,
  SVGRenderer,
]);

// Bars keep a constant share of each category slot, so they scale with the chart width
const barCategoryGap = '40%';

// Echarts renders its own text (axis labels via SVG, the tooltip as a separately styled div)
// rather than inheriting the page's CSS
const fontFamily =
  "'Montserrat Variable', Montserrat, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'";

export interface ChartProps {
  series: ChartSeries;
  onAllSeriesHiddenChange?: (allSeriesHidden: boolean) => void;
}

export interface ChartHandle {
  toggleAllSeries: () => void;
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

const Chart = forwardRef<ChartHandle, ChartProps>(({ series, onAllSeriesHiddenChange }, ref) => {
  const echartRef = useRef<EChartsReact | null>(null);

  const translate = useTranslate();
  const translatedSeries = translateChartData(series, namespacedTranslate(translate, 'series'));

  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({});
  const [allSeriesHidden, setAllSeriesHidden] = useState<boolean>(false);

  // Which series the mouse is directly over, kept in a ref (not state) so reading it from inside
  // the tooltip formatter below never waits on - or triggers - a React re-render
  const hoveredSeriesName = useRef<string | null>(null);

  // Identifies this chart's own tooltip root in the DOM, so the hover can find and restyle the
  // matching row directly. Echarts won't re-run the formatter just because this ref changed
  const tooltipId = useId();

  const echartSeries = translatedSeries.data.map((cSeries, index) => {
    return {
      name: cSeries.name,
      type: 'bar',
      stack: 'Total',
      barCategoryGap,
      areaStyle: {},
      itemStyle: {
        opacity: 0.8,
        color: colors[index % colors.length],
      },
      emphasis: {
        focus: 'series',
      },
      data: cSeries.data.map((value) => series.converter(value)),
    };
  });

  const echartSeriesTotal = {
    name: '',
    type: 'bar',
    stack: 'Total',
    barCategoryGap,
    color: '#ffffff00',
    data: series.categories.map((_, i) =>
      '0.0000' + series.formatter(translatedSeries.data.reduce((sum, s) => sum + (s.data[i] || 0), 0))
    ),
  };

  const options = {
    color: colors,
    animationDuration: 0,
    animationDurationUpdate: 300,
    textStyle: { fontFamily },
    tooltip: {
      trigger: 'axis',
      transitionDuration: 0,
      textStyle: { fontFamily },
      // appendTo lets confine measure against the actual viewport
      appendTo: 'body',
      confine: true,
      extraCssText: 'max-height: 80vh; max-width: 90vw; overflow-y: auto;',
      // The formatter removes the zero-entries and creates two columns when there are many entries
      // for legibility
      formatter: (rawParams: unknown) => {
        const params = (Array.isArray(rawParams) ? rawParams : [rawParams]) as Array<{
          axisValueLabel: string;
          marker: string;
          seriesName: string;
          value: number | string;
        }>;

        const formatValue = (v: number | string) =>
          typeof v === 'string' ? v.substring(6) : series.formatter(v, true);

        // The "total" helper series (empty name, string value) always shows, even when zero
        const visible = params.filter((p) => typeof p.value === 'string' || !/^-?0(\s|$)/.test(formatValue(p.value)));

        if (visible.length === 0) return '';

        // The "total" row always renders on its own, full-width, below the real series
        const isTotalRow = (p: { value: number | string }) => typeof p.value === 'string';
        const realRows = visible.filter((p) => !isTotalRow(p));
        const totalRow = visible.find(isTotalRow);

        // Make sure the label wraps on one line, even when hovered, use inline style to help against echarts overwrites
        const row = (p: (typeof visible)[number], isTotal: boolean) => {
          const isHovered = !isTotal && p.seriesName === hoveredSeriesName.current;

          return (
            `<div${isTotal ? '' : ` data-series="${p.seriesName}"`} style="display: flex; justify-content: space-between; align-items: baseline; gap: 12px; padding: 3px 4px; border-radius: 4px;${
              isHovered ? ' background: #f3f4f6;' : ''
            }${isTotal ? ' border-top: 1px solid #e5e7eb; margin-top: 4px; padding-top: 6px; font-weight: 600;' : ''}">` +
            `<span class="tooltip-row-label" style="min-width: 0; white-space: normal; overflow-wrap: break-word;${isHovered ? ' font-weight: 600;' : ''}">${isTotal ? '' : `${p.marker}${p.seriesName}`}</span>` +
            `<span style="flex-shrink: 0; font-weight: 600;">${formatValue(p.value)}</span>` +
            `</div>`
          );
        };

        // Chunked into fixed-width columns manually because content inside gets updated by echarts, so we can't rely
        // on flex
        const columnCount = Math.max(1, Math.ceil(realRows.length / 15));
        const rowsPerColumn = Math.ceil(realRows.length / columnCount);
        const columnsHtml = Array.from({ length: columnCount }, (_, i) => {
          const chunk = realRows.slice(i * rowsPerColumn, (i + 1) * rowsPerColumn);
          return `<div style="width: 308px; padding: 0 8px; box-sizing: border-box;">${chunk.map((p) => row(p, false)).join('')}</div>`;
        }).join('');

        return (
          `<div id="${tooltipId}">` +
          `<div style="font-weight: 700; margin-bottom: 4px;">${params[0]?.axisValueLabel ?? ''}</div>` +
          `<div style="display: flex; flex-wrap: wrap; gap: 24px;">${columnsHtml}</div>` +
          (totalRow ? row(totalRow, true) : '') +
          `</div>`
        );
      },
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
          fontFamily,
          formatter: ({ axisDimension, value }: { axisDimension: 'x' | 'y'; value: number }) => {
            if (axisDimension === 'y') {
              return series.formatter(value, true).replace(/\.[^\s]*/, '');
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
      left: '3%',
      right: '2%',
      bottom: '0%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: true,
        data: series.categories,
        axisLabel: { fontSize: 14 },
      },
    ],
    yAxis: [
      {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => {
            const [numericPart, unitPart] = series.formatter(value, true).split(' ');
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
    series: [...echartSeries, echartSeriesTotal],
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

  // Toggle the visibility of all series
  const onToggleAllSeries = useCallback(() => {
    if (!echartRef.current) {
      return;
    }

    const instance = echartRef.current.getEchartsInstance();
    const newVisibilityState = !allSeriesHidden;

    const updatedHiddenSeries = translatedSeries.data.reduce((acc, { name }) => {
      acc[name] = newVisibilityState;
      return acc;
    }, {} as Record<string, boolean>);

    const updatedSelected = translatedSeries.data.reduce((acc, { name }) => {
      acc[name] = !newVisibilityState;
      return acc;
    }, {} as Record<string, boolean>);

    instance.setOption({
      legend: {
        selected: updatedSelected,
      },
    });
    setHiddenSeries(updatedHiddenSeries);
    setAllSeriesHidden(newVisibilityState);
  }, [allSeriesHidden, translatedSeries]);

  useEffect(() => onAllSeriesHiddenChange?.(allSeriesHidden), [allSeriesHidden, onAllSeriesHiddenChange]);


  useImperativeHandle(ref, () => ({ toggleAllSeries: onToggleAllSeries }), [onToggleAllSeries]);

  // When hovering the series-block in the chart, hover the label/row in the tooltip
  const applyTooltipHighlight = useCallback(
    (name: string | null) => {
      const tooltip = document.getElementById(tooltipId);
      if (!tooltip) return;

      tooltip.querySelectorAll<HTMLElement>('[data-series]').forEach((row) => {
        const isHovered = name !== null && row.dataset.series === name;
        row.style.background = isHovered ? '#f3f4f6' : '';

        const label = row.querySelector<HTMLElement>('.tooltip-row-label');
        if (label) label.style.fontWeight = isHovered ? '600' : '';
      });
    },
    [tooltipId]
  );

  // Track which series the mouse is directly over on the chart itself to highlight the matching row.
  const chartEvents = useMemo(
    () => ({
      mouseover: (params: { componentType: string; seriesName: string }) => {
        if (params.componentType === 'series') {
          hoveredSeriesName.current = params.seriesName;
          applyTooltipHighlight(params.seriesName);
        }
      },
      mouseout: (params: { componentType: string; seriesName: string }) => {
        if (params.componentType === 'series' && hoveredSeriesName.current === params.seriesName) {
          hoveredSeriesName.current = null;
          applyTooltipHighlight(null);
        }
      },
    }),
    [applyTooltipHighlight]
  );

  return (
    <div>
      <div className="h-[clamp(320px,52vh,600px)]">
        <ReactEChartsCore
          echarts={echarts}
          ref={echartRef}
          notMerge
          option={options}
          onEvents={chartEvents}
          style={{ height: '100%' }}
        />
      </div>
      <div className="pt-4">
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
});

Chart.displayName = 'Chart';

export default Chart;
