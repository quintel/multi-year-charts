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

/**
 * Creates a table row representing a single series and the data for each year.
 */
const renderRow = (series: Row, format: UnitFormatter) => {
  // Avoids TypeScript complaining about a lack of a call signature for
  // series.data.map.
  const formattedData = [...series.data].map(format);
  let rowClass = '';

  if (formattedData.every((val) => val === formattedData[0])) {
    // Every value is the same; make the row appear lighter.
    rowClass = 'text-gray-500';
  }

  const columns = formattedData.map((value, index) => {
    const [fValue, fUnit] = value.split(' ');

    return (
      <td
        key={`series-${series.name}-${index}`}
        className="px-3 py-2 text-right tabular-nums last:pr-6"
      >
        {fValue} {fUnit}
      </td>
    );
  });

  return (
    <tr key={`series-${series.name}`} className={`${rowClass} border-b last:border-b-0`}>
      <td className="px-3 py-2 pl-6">{series.name}</td>
      {columns}
    </tr>
  );
};

const ChartTable: FC<Omit<ChartProps, 'style' | 'type'>> = ({ series }) => {
  const { translate } = useContext(LocaleContext);

  const translatedData = translateChartData(series, namespacedTranslate(translate, 'series'));

  return (
    <table className="chart-as-table w-full text-sm">
      <thead>
        <tr className="border-b-2 border-gray-300">
          <th className="px-3 pl-6 text-left">Key</th>
          {series.categories.map((year) => (
            <th key={`year-${year}`} className="p-3 text-right last:pr-6">
              {year}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{translatedData.data.map((d) => renderRow(d, series.formatter))}</tbody>
    </table>
  );
};

export default ChartTable;
