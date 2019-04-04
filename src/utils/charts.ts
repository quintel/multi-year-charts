import { ScenarioJSON } from './api';
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
  scenarios: ScenarioJSON[],
  gqueries: string[]
): ChartSeries => {
  const sorted = scenarios.slice().sort((a, b) => {
    return a.scenario.end_year - b.scenario.end_year;
  });

  return {
    categories: sorted.map(scenarioData => {
      return scenarioData.scenario.end_year;
    }),
    data: gqueries.map(gquery => ({
      name: gquery,
      data: sorted.map(scenarioData => scenarioData.gqueries[gquery].future)
    }))
  };
};
