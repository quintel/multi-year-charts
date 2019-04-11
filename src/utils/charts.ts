import { ScenarioData } from './api/types';
import 'apexcharts';

export interface ChartSeries {
  categories: number[];
  data: ApexAxisChartSeries;
}

/**
 * Given a collection of ScenarioJSON and the key of a gquery, transformed
 * the scenario data into data for a single axis in an Apex chart.
 */
export const scenariosToChartData = (
  scenarios: ScenarioData[],
  gqueries: string[]
): ChartSeries => {
  const sorted = scenarios.slice().sort((a, b) => {
    return a.scenario.endYear - b.scenario.endYear;
  });

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
