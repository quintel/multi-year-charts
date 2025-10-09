import { FC, useContext } from 'react';

import { ChartProps } from './Chart';
import LocaleContext from '../utils/LocaleContext';
import { namespacedTranslate } from '../utils/translate';

import { translateChartData } from '../utils/charts';
import { UnitFormatter } from '../utils/units';

interface Row {
  name: string;
  data: number[];
}

const colors = [
  '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272',
  '#fc8452', '#9a60b4', '#ea7ccc', '#c65470', '#75cc91', '#5858fa',
  '#66eecc', '#de7373', '#a23b72', '#52fc84', '#b49a60', '#cc7cea',
  '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272',
  '#fc8452', '#9a60b4', '#ea7ccc', '#c65470', '#75cc91', '#5858fa',
  '#66eecc', '#de7373', '#a23b72', '#52fc84', '#b49a60', '#cc7cea'
];

const formatDelta = (value: number, format: UnitFormatter) => {
  if (value > 0) {
    return `+${format(value)}`;
  }

  return format(value);
};

/**
 * Creates a table row representing a single series and the data for each year.
 */
const renderRow = (series: Row, format: UnitFormatter, index: number) => {
  const formattedData = [...series.data].map((v) => format(v));
  let rowClass = '';

  if (formattedData.every((val) => val === formattedData[0])) {
    rowClass = 'text-gray-400 hover:text-gray-800';
  }

  const columns = formattedData.map((value, colIndex) => {
    const originalValue = series.data[colIndex];
    const prevValue = series.data[colIndex - 1];
    const delta = colIndex > 0 ? originalValue - prevValue : 0;

    return (
      <td
      key={`series-${series.name}-${index}-${colIndex}`}
        className="px-3 py-2 text-right align-top tabular-nums fixed-width-cell"
      >
        {value}
        {colIndex > 0 ? (
          <div className="mt-1 flex items-center justify-end text-xs text-gray-400">
            {delta === 0 ? '–' : formatDelta(delta, format)}
          </div>
        ) : null}
      </td>
    );
  });

  return (
    <tr
      key={`series-${series.name}`}
      className={`${rowClass} border-b transition-colors [&:nth-last-child(2)]:border-b-2`}
    >
      <td className="px-3 py-2 align-top text-gray-800 fixed-width-cell">
        {index >= 0 ? (
          <span
            className="-mt-0.5 mr-1 inline-flex h-3.5 w-3.5 rounded-sm align-middle"
            style={{ backgroundColor: colors[index % colors.length] }}
          />
        ) : null}
        {series.name}
      </td>
      {columns}
    </tr>
  );
};

const ChartTable: FC<Omit<ChartProps, 'style' | 'type'> & { colorSeries?: boolean }> = ({
  series,
  colorSeries,
}) => {
  const { translate } = useContext(LocaleContext);

  const translatedData = translateChartData(series, namespacedTranslate(translate, 'series'));

  return (
    <table className="chart-as-table w-full text-sm">
      <thead>
        <tr className="sticky top-0 border-b-2 border-gray-300 bg-white">
          <th className="px-3 text-left fixed-width-cell"></th>
          {series.categories.map((year, index) => (
            <th key={`year-${index}`} className="p-3 text-right fixed-width-cell">
              {year}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {translatedData.data.map((d, i) => renderRow(d, series.formatter, colorSeries ? i : -1))}
        <tr className="transition-colors">
          <td className="px-3 fixed-width-cell">{translate('series.total')}</td>
          {series.categories.map((_, i) => (
            <td key={`year-total-${i}`} className="p-3 text-right fixed-width-cell">
              {series.formatter(translatedData.data.reduce((sum, s) => sum + (s.data[i] || 0), 0))}
            </td> 
          ))}
        </tr>
      </tbody>
    </table>
  );
};

export default ChartTable;
