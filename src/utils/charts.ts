import { ScenarioIndexedScenarioData } from './api/types';
import 'apexcharts';

import sortScenarios from './sortScenarios';

export interface ChartSeries {
  categories: number[];
  data: ApexAxisChartSeries;
  unit: string;
}

/**
 * Given a collection of ScenarioJSON and the key of a gquery, transformed
 * the scenario data into data for a single axis in an Apex chart.
 */
export const scenariosToChartData = (
  scenarios: ScenarioIndexedScenarioData,
  gqueries: string[]
): ChartSeries => {
  const sorted = sortScenarios(Object.values(scenarios));

  const unit = Object.values(scenarios)[0].gqueries[gqueries[0]].unit;

  return {
    categories: sorted.map(scenarioData => {
      return scenarioData.scenario.endYear;
    }),
    data: gqueries.map(gquery => ({
      name: gquery,
      data: sorted.map(scenarioData => scenarioData.gqueries[gquery].future)
    })),
    unit
  };
};

export const translateChartData = (
  series: ChartSeries,
  translate: (key: string) => string
): ChartSeries => {
  const newData = series.data.map(seriesData => {
    return { ...seriesData, name: translate(seriesData.name) };
  });

  return { ...series, data: newData };
};
