import React, { FC, useContext } from 'react';

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
  '#5470c6',
  '#91cc75',
  '#fac858',
  '#ee6666',
  '#73c0de',
  '#3ba272',
  '#fc8452',
  '#9a60b4',
  '#ea7ccc',
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
  // Avoids TypeScript complaining about a lack of a call signature for
  // series.data.map.
  const formattedData = [...series.data].map(format);
  let rowClass = '';

  if (formattedData.every((val) => val === formattedData[0])) {
    // Every value is the same; make the row appear lighter.
    rowClass = 'text-gray-400 hover:text-gray-800';
  }

  const columns = formattedData.map((value, index) => {
    const originalValue = series.data[index];
    const prevValue = series.data[index - 1];
    const delta = index > 0 ? originalValue - prevValue : 0;

    return (
      <td
        key={`series-${series.name}-${index}`}
        className="px-3 py-2 text-right align-top tabular-nums"
      >
        {value}
        {index > 0 ? (
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
      className={`${rowClass} border-b transition-colors last:border-b-2 hover:bg-gray-100`}
    >
      <td className="px-3 py-2 align-top text-gray-800 ">
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
        <tr className="border-b-2 border-gray-300">
          <th className="px-3 text-left">Key</th>
          {series.categories.map((year) => (
            <th key={`year-${year}`} className="p-3 text-right">
              {year}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {translatedData.data.map((d, i) => renderRow(d, series.formatter, colorSeries ? i : -1))}
      </tbody>
    </table>
  );
};

export default ChartTable;
