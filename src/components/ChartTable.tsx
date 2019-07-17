import React, { FC, useContext } from 'react';
import 'apexcharts';

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

  if (formattedData.every(val => val === formattedData[0])) {
    // Every value is the same; make the row appear lighter.
    rowClass = 'has-text-grey';
  }

  const columns = formattedData.map((value, index) => {
    const [fValue, fUnit] = value.split(' ');

    return (
      <td key={`series-${series.name}-${index}`}>
        {fValue} <small>{fUnit}</small>
      </td>
    );
  });

  return (
    <tr key={`series-${series.name}`} className={rowClass}>
      <td>{series.name}</td>
      {columns}
    </tr>
  );
};

const ChartTable: FC<ChartProps> = ({ series }) => {
  const { translate } = useContext(LocaleContext);

  const translatedData = translateChartData(
    series,
    namespacedTranslate(translate, 'series')
  );

  return (
    <table className="chart-as-table table is-fullwidth">
      <thead>
        <tr>
          <th>Key</th>
          {series.categories.map(year => (
            <th key={`year-${year}`}>{year}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {translatedData.data.map(d => renderRow(d, series.formatter))}
      </tbody>
    </table>
  );
};

export default ChartTable;
