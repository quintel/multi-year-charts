import { flattenChart, scenariosToChartData } from '../charts';
import { ChartSchema } from '../../data/charts';

const chartFixture: ChartSchema = {
  key: 'my_chart',
  slug: 'my-chart',
  variants: [
    {
      key: 'variant_one',
      slug: 'variant-one',
      series: ['a', 'b', 'c'],
    },
    {
      key: 'variant_two',
      slug: 'variant-two',
      series: ['d', 'e', 'f'],
      displayAs: 'table',
    },
  ],
};

it('returns the first variant when none is named', () => {
  expect(flattenChart(chartFixture)).toEqual({
    key: 'my_chart-variant_one',
    chartKey: 'my_chart',
    variantKey: 'variant_one',
    slug: 'my-chart/variant-one',
    series: ['a', 'b', 'c'],
    displayAs: 'chart',
    numVariants: 2,
  });
});

it('returns the first variant when wanting "variant-one', () => {
  expect(flattenChart(chartFixture, 'variant-one')).toEqual({
    key: 'my_chart-variant_one',
    chartKey: 'my_chart',
    variantKey: 'variant_one',
    slug: 'my-chart/variant-one',
    series: ['a', 'b', 'c'],
    displayAs: 'chart',
    numVariants: 2,
  });
});

it('returns the second variant when wanting "variant-two', () => {
  expect(flattenChart(chartFixture, 'variant-two')).toEqual({
    key: 'my_chart-variant_two',
    chartKey: 'my_chart',
    variantKey: 'variant_two',
    slug: 'my-chart/variant-two',
    series: ['d', 'e', 'f'],
    displayAs: 'table',
    numVariants: 2,
  });
});

it('returns the first variant when an invalid name is given', () => {
  expect(flattenChart(chartFixture, 'nope')).toEqual({
    key: 'my_chart-variant_one',
    chartKey: 'my_chart',
    variantKey: 'variant_one',
    slug: 'my-chart/variant-one',
    series: ['a', 'b', 'c'],
    displayAs: 'chart',
    numVariants: 2,
  });
});

describe('scenariosToChartData', () => {
  const scenario = (id: number, endYear: number, order: number) => ({
    scenario: { id, areaCode: 'nl', endYear, startYear: 2019, url: '' },
    gqueries: { a: { present: 1, future: 2, unit: 'MJ' } },
    updatedAt: '2026-09-01T10:00:00.000Z',
    userValues: {},
    balancedValues: {},
    order,
  });

  // A column is headed by its end year. The saved scenario title is deliberately not shown.
  it('heads each column with its end year, after the present', () => {
    const series = scenariosToChartData(
      { 1: scenario(1, 2040, 0), 2: scenario(2, 2050, 1) } as never,
      ['a']
    );

    expect(series.categories).toEqual([2019, 2040, 2050]);
  });
});
