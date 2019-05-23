import { ScenarioIndexedScenarioData } from './api/types';
import 'apexcharts';

import sortScenarios from './sortScenarios';

import { ChartSchema, FlattenedChartSchema } from '../data/charts';

export interface ChartSeries {
  categories: number[];
  data: ApexAxisChartSeries;
  unit: string;
}

/**
 * Given a chart and (optional) variant names, returns a new data structure
 * containing the chart and variant slug, and the series needed to render the
 * chart.
 */
export const flattenChart = (
  chart: ChartSchema,
  variantSlug?: string
): FlattenedChartSchema => {
  let variant;

  if (variantSlug) {
    variant = chart.variants.find(variant => variant.slug === variantSlug);
  }

  variant = variant || chart.variants[0];

  return {
    key: `${chart.key}-${variant.key}`,
    chartKey: chart.key,
    variantKey: variant.key,
    slug: `${chart.slug}/${variant.slug}`,
    series: variant.series
  };
};

/**
 * Given a collection of ScenarioJSON and the key of a gquery, transformed
 * the scenario data into data for a single axis in an Apex chart.
 */
export const scenariosToChartData = (
  scenarios: ScenarioIndexedScenarioData,
  gqueries: string[]
): ChartSeries => {
  const sorted = sortScenarios(Object.values(scenarios));
  const firstScenario = Object.values(scenarios)[0];
  const unit = firstScenario.gqueries[gqueries[0]].unit;

  return {
    categories: [firstScenario.scenario.startYear].concat(
      sorted.map(scenarioData => {
        return scenarioData.scenario.endYear;
      })
    ),
    data: gqueries.map(gquery => ({
      name: gquery,
      data: [firstScenario.gqueries[gquery].present].concat(
        sorted.map(scenarioData => scenarioData.gqueries[gquery].future)
      )
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
