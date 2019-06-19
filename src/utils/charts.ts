import { ScenarioIndexedScenarioData } from './api/types';

import sortScenarios from './sortScenarios';

import { ChartSchema, FlattenedChartSchema } from '../data/charts';
import { TranslateFunc } from '../utils/LocaleContext';

export interface ChartSeries {
  categories: number[];
  data: { name: string, data: number[] }[];
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
    series: variant.series,
    displayAs: variant.displayAs || 'chart'
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

/**
 * Represent a function which can be called to format a query value with the
 * unit.
 */
export type UnitFormatter = (val: number) => string;

/**
 * Given a unit name, creates a function which can format values with that unit.
 */
export const createUnitFormatter = (unit: string): UnitFormatter => {
  switch (unit) {
    case 'MJ':
      return val => `${(val / 1000000000).toFixed(2)} PJ`;
    case 'tonne':
      return val => `${(val / 1000000).toFixed(2)} MT`;
    default:
      return val => `${val.toFixed(2)} ${unit}`;
  }
};

/**
 * Extracts substrings from a series name in an attempt to find the name of the
 * carrier or sector represented by the name. Provide the name, matching
 * substring ('in' or 'of'), and the translate function.
 *
 * For example
 *
 *   translateSubstr('final_demand_of_hydrogen', 'of', translate)
 *   // => "Hydrogen"
 *
 *   translateSubstr('final_demand_in_households', 'in', translate)
 *   // => "Households"
 */
const translateSubstr = (
  name: string,
  prefix: 'in' | 'of',
  translate: (key: string) => string
): string => {
  const re = new RegExp(`_${prefix}_(.*?)((_of_|_in_|$))`);
  const match = name.match(re);

  if (!match) {
    return translate(name);
  }

  return translate(match[1]);
};

/**
 * Given the name of a series and a translation function, attempts to translate
 * the name of the series to a human-readable name.
 *
 * If the translation function returns a value for the full series name, it will
 * always be used. Otherwise, we try to look for "of" and/or "in" substrings
 * which would indicate that the series represents a carrier or sector.
 */
const translateSeries = (name: string, translate: TranslateFunc) => {
  let translated = translate(name);

  if (name === translated) {
    // No specific translation found, so we infer from looking for _of_ and
    // _in_ sections naming carriers or sectors.
    const hasIn = name.match(/_in_/);
    const hasOf = name.match(/_of_/);

    if (hasIn && hasOf) {
      // The name is in the form _of_(carrier)_in_(sector)
      const sector = translateSubstr(name, 'in', translate);
      const carrier = translateSubstr(name, 'of', translate);

      translated = translate('carrier_in_sector', {
        carrier,
        sector: sector.toLowerCase()
      });
    } else if (hasIn) {
      // The name is in the form _in_(sector)
      translated = translateSubstr(name, 'in', translate);
    } else if (hasOf) {
      // The name is in the form _of_(carrier)
      translated = translateSubstr(name, 'of', translate);
    }
  }

  return translated;
};

/**
 * Given chart data, returns a copy of the data with the name of each series
 * translated to a human-readable text.
 */
export const translateChartData = (
  series: ChartSeries,
  translate: TranslateFunc
): ChartSeries => {
  const newData = series.data.map(seriesData => ({
    ...seriesData,
    name: translateSeries(seriesData.name, translate)
  }));

  return { ...series, data: newData };
};
