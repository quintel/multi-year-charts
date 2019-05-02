import { ScenarioIndexedScenarioData } from './api/types';
import 'apexcharts';

import sortScenarios from './sortScenarios';

export interface ChartSeries {
  categories: number[];
  data: ApexAxisChartSeries;
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

  return {
    categories: sorted.map(scenarioData => {
      return scenarioData.scenario.endYear;
    }),
    data: gqueries.map(gquery => ({
      name: gquery,
      data: sorted.map(scenarioData => scenarioData.gqueries[gquery].future)
    }))
  };
};
