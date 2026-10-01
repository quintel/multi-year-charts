import { ScenarioIndexedScenarioData, ScenarioData } from './api/types';

import sortScenarios from './sortScenarios';

import { ChartSchema, FlattenedChartSchema, VariantNode } from '../data/charts';
import { TranslateFunc } from '../utils/LocaleContext';
import { createScalingFormatter, UnitFormatter } from './units';
import { createDefaultUnitConverter, UnitConverter } from './units';
import { namespacedTranslate } from './translate';

export interface ChartSeries {
  categories: number[];
  data: { name: string; data: number[] }[];
  formatter: UnitFormatter;
  converter: UnitConverter;
}

const isRenderable = (node: VariantNode): node is VariantNode & { series: string[] } =>
  node.series !== undefined;

/**
 * The path down to the first renderable node reachable from this list of siblings: the first
 * node itself if it already renders something, otherwise the first leaf under its first child,
 * and so on. Used to pick a default when a path is missing, incomplete, or lands on a pure
 * branch with nothing of its own to show.
 */
export const firstLeafPath = (nodes: VariantNode[]): VariantNode[] => {
  const [first] = nodes;

  if (!first) return [];
  if (isRenderable(first)) return [first];

  return [first, ...firstLeafPath(first.children || [])];
};

/**
 * Walks slugs down the variant tree one segment per level, always returning a full
 * renderable path. Falls back to firstLeafPath.
 */
export const resolveVariantPath = (nodes: VariantNode[], slugs: string[]): VariantNode[] => {
  const [slug, ...rest] = slugs;
  const match = slug ? nodes.find((node) => node.slug === slug) : undefined;

  if (!match) return firstLeafPath(nodes);
  if (isRenderable(match) && rest.length === 0) return [match];

  return [match, ...resolveVariantPath(match.children || [], rest)];
};

/**
 * How many distinct renderable views this variant tree offers in total, across every depth.
 */
export const countLeaves = (nodes: VariantNode[]): number =>
  nodes.reduce(
    (total, node) => total + (isRenderable(node) ? 1 : 0) + countLeaves(node.children || []),
    0
  );

/**
 * Given a chart and the variant path segments from the URL, returns a new data structure
 * containing the chart and full variant slug path, and the series needed to render the chart.
 */
export const flattenChart = (chart: ChartSchema, variantSlugs: string[] = []): FlattenedChartSchema => {
  const path = resolveVariantPath(chart.variants, variantSlugs);
  const leaf = path[path.length - 1];

  return {
    key: `${chart.key}-${leaf.key}`,
    chartKey: chart.key,
    variantKey: leaf.key,
    variantPath: path.map((node) => node.key),
    slug: `${chart.slug}/${path.map((node) => node.slug).join('/')}`,
    series: leaf.series || [],
    displayAs: leaf.displayAs || 'chart',
    hasVariants: countLeaves(chart.variants) > 1,
  };
};

/**
 * Given a collection of ScenarioData and a list of gquery names, extracts the
 * maximum value of the gqueries in any of the scenarios.
 */
const maxValueFromScenarios = (scenarios: ScenarioData[], gqueries: string[]) => {
  let maxValue = 0;

  gqueries.forEach((gquery) => {
    scenarios.forEach((scenario) => {
      const value = scenario.gqueries[gquery].future;

      if (value > maxValue) {
        maxValue = value;
      }
    });
  });

  return maxValue;
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

  const maxValue = maxValueFromScenarios(sorted, gqueries);
  const formatter = createScalingFormatter(maxValue, unit);
  const converter = createDefaultUnitConverter(unit);

  return {
    categories: [
      firstScenario.scenario.startYear,
      ...sorted.map(({ scenario }) => scenario.endYear),
    ],
    data: gqueries.map((gquery) => ({
      name: gquery,
      data: [firstScenario.gqueries[gquery].present].concat(
        sorted.map((scenarioData) => scenarioData.gqueries[gquery].future)
      ),
    })),
    formatter,
    converter,
  };
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
        sector: sector.toLowerCase(),
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
export const translateChartData = (series: ChartSeries, translate: TranslateFunc): ChartSeries => {
  const newData = series.data.map((seriesData) => ({
    ...seriesData,
    name: translateSeries(seriesData.name, translate),
  }));

  return { ...series, data: newData };
};

/**
 * Converts a chart to CSV
 */
// A translated series name is free text, so a comma in it would otherwise split the row.
const csvField = (value: string | number): string => {
  const text = String(value);

  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const chartToCSV = (series: ChartSeries, translate: TranslateFunc): string => {
  const translated = translateChartData(series, namespacedTranslate(translate, 'series'));

  const headers = ['Subject', 'Units', ...series.categories.map(csvField)].join(',');
  const rows = translated.data.map((seriesData) => {
    const convertedData = seriesData.data.map((value) => {
      const formattedValue = series.formatter(value);
      const [valuePart, unitPart] = formattedValue.split(' ');
      return { valuePart, unitPart };
    });

    const unit = convertedData.length > 0 ? convertedData[0].unitPart : '';
    const values = convertedData.map(data => data.valuePart);

    return [csvField(seriesData.name), unit, ...values].join(','); // Add the unit as the second column
  });

  return `${headers}\n${rows.join('\n')}`;
};
