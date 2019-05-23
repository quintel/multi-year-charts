import { flattenChart } from '../charts';
import { ChartSchema } from '../../data/charts';

const chartFixture: ChartSchema = {
  key: 'my_chart',
  slug: 'my-chart',
  variants: [
    {
      key: 'variant_one',
      slug: 'variant-one',
      series: ['a', 'b', 'c']
    },
    {
      key: 'variant_two',
      slug: 'variant-two',
      series: ['d', 'e', 'f']
    }
  ]
};

it('returns the first variant when none is named', () => {
  expect(flattenChart(chartFixture)).toEqual({
    key: 'my_chart-variant_one',
    chartKey: 'my_chart',
    variantKey: 'variant_one',
    slug: 'my-chart/variant-one',
    series: ['a', 'b', 'c']
  });
});

it('returns the first variant when wanting "variant-one', () => {
  expect(flattenChart(chartFixture, 'variant-one')).toEqual({
    key: 'my_chart-variant_one',
    chartKey: 'my_chart',
    variantKey: 'variant_one',
    slug: 'my-chart/variant-one',
    series: ['a', 'b', 'c']
  });
});

it('returns the second variant when wanting "variant-two', () => {
  expect(flattenChart(chartFixture, 'variant-two')).toEqual({
    key: 'my_chart-variant_two',
    chartKey: 'my_chart',
    variantKey: 'variant_two',
    slug: 'my-chart/variant-two',
    series: ['d', 'e', 'f']
  });
});

it('returns the first variant when an invalid name is given', () => {
  expect(flattenChart(chartFixture, 'nope')).toEqual({
    key: 'my_chart-variant_one',
    chartKey: 'my_chart',
    variantKey: 'variant_one',
    slug: 'my-chart/variant-one',
    series: ['a', 'b', 'c']
  });
});
