import {
  countLeaves,
  firstLeafPath,
  flattenChart,
  resolveVariantPath,
  scenariosToChartData,
  translateChartData,
  chartToCSV,
} from '../charts';
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

// A branch that's also directly renderable, plus two leaves underneath it — the shape that lets
// a chart both show a combined view and drill down further, e.g. "By carrier" > "Households"
const nestedChartFixture: ChartSchema = {
  key: 'nested_chart',
  slug: 'nested-chart',
  variants: [
    {
      key: 'top',
      slug: 'top',
      series: ['x'],
      children: [
        { key: 'branch', slug: 'branch', series: ['y'], children: [
          { key: 'leaf_one', slug: 'leaf-one', series: ['a'] },
          { key: 'leaf_two', slug: 'leaf-two', series: ['b'] },
        ] },
        { key: 'childless_branch', slug: 'childless-branch', children: [
          { key: 'only_leaf', slug: 'only-leaf', series: ['c'] },
        ] },
      ],
    },
  ],
};

it('returns the first variant when none is named', () => {
  expect(flattenChart(chartFixture)).toEqual({
    key: 'my_chart-variant_one',
    chartKey: 'my_chart',
    variantKey: 'variant_one',
    variantPath: ['variant_one'],
    slug: 'my-chart/variant-one',
    series: ['a', 'b', 'c'],
    displayAs: 'chart',
    hasVariants: true,
  });
});

it('returns the first variant when wanting "variant-one', () => {
  expect(flattenChart(chartFixture, ['variant-one'])).toEqual({
    key: 'my_chart-variant_one',
    chartKey: 'my_chart',
    variantKey: 'variant_one',
    variantPath: ['variant_one'],
    slug: 'my-chart/variant-one',
    series: ['a', 'b', 'c'],
    displayAs: 'chart',
    hasVariants: true,
  });
});

it('returns the second variant when wanting "variant-two', () => {
  expect(flattenChart(chartFixture, ['variant-two'])).toEqual({
    key: 'my_chart-variant_two',
    chartKey: 'my_chart',
    variantKey: 'variant_two',
    variantPath: ['variant_two'],
    slug: 'my-chart/variant-two',
    series: ['d', 'e', 'f'],
    displayAs: 'table',
    hasVariants: true,
  });
});

it('returns the first variant when an invalid name is given', () => {
  expect(flattenChart(chartFixture, ['nope'])).toEqual({
    key: 'my_chart-variant_one',
    chartKey: 'my_chart',
    variantKey: 'variant_one',
    variantPath: ['variant_one'],
    slug: 'my-chart/variant-one',
    series: ['a', 'b', 'c'],
    displayAs: 'chart',
    hasVariants: true,
  });
});

describe('nested variant trees', () => {
  it('resolves a full path down to a leaf several levels deep', () => {
    expect(flattenChart(nestedChartFixture, ['top', 'branch', 'leaf-two'])).toMatchObject({
      variantKey: 'leaf_two',
      variantPath: ['top', 'branch', 'leaf_two'],
      slug: 'nested-chart/top/branch/leaf-two',
      series: ['b'],
    });
  });

  it('renders a branch node itself when the path stops there and it has its own series', () => {
    expect(flattenChart(nestedChartFixture, ['top', 'branch'])).toMatchObject({
      variantKey: 'branch',
      series: ['y'],
    });
  });

  it('descends to the first leaf when the path stops on a branch with nothing of its own', () => {
    expect(flattenChart(nestedChartFixture, ['top', 'childless-branch'])).toMatchObject({
      variantKey: 'only_leaf',
      variantPath: ['top', 'childless_branch', 'only_leaf'],
      series: ['c'],
    });
  });

  it('falls back to the first leaf path entirely when a segment is invalid', () => {
    expect(flattenChart(nestedChartFixture, ['top', 'nope'])).toMatchObject({
      variantKey: 'branch',
      series: ['y'],
    });
  });

  it('counts every renderable leaf across the whole tree', () => {
    // top, branch, leaf_one, leaf_two, and only_leaf are each renderable; childless_branch isn't
    expect(countLeaves(nestedChartFixture.variants)).toBe(5);
  });

  it('finds the first leaf path from the top of the tree', () => {
    expect(firstLeafPath(nestedChartFixture.variants).map((node) => node.key)).toEqual(['top']);
  });

  it('resolveVariantPath with no slugs returns the default (first) leaf path', () => {
    expect(resolveVariantPath(nestedChartFixture.variants, []).map((node) => node.key)).toEqual(['top']);
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

describe('translateChartData', () => {
  const names = (seriesNames: string[]) => {
    const series = {
      categories: [2019],
      data: seriesNames.map((name) => ({ name, data: [1] })),
      formatter: (value: number) => String(value),
      converter: (value: number) => value,
    };
    // Untranslated keys come back as-is; the sector and carrier tokens have a translation
    const translate = (key: string) => (key.startsWith('myc_') ? key : key.toUpperCase());

    return translateChartData(series as never, translate).data.map(({ name }) => name);
  };

  // A sector shows its carriers and a carrier shows its sectors, without the use type
  it('names final energy consumption series by the dimension that varies', () => {
    expect(
      names([
        'myc_sector_final_consumption_from_other_non_energetic',
        'myc_sector_final_consumption_of_electricity_in_households_total',
        'myc_carrier_final_consumption_of_non_renewable_waste_energetic',
        'myc_carrier_final_consumption_of_electricity_in_industry_ict_non_energetic',
      ])
    ).toEqual(['OTHER', 'ELECTRICITY', 'NON_RENEWABLE_WASTE', 'INDUSTRY_ICT']);
  });
});

describe('translateChartData for residences', () => {
  const names = (seriesNames: string[]) => {
    const series = {
      categories: [2019],
      data: seriesNames.map((name) => ({ name, data: [1] })),
      formatter: (value: number) => String(value),
      converter: (value: number) => value,
    };

    return translateChartData(series as never, (key: string) => key).data.map(({ name }) => name);
  };

  it('labels a type breakdown by its periods', () => {
    expect(names(['number_of_apartments_before_1945', 'number_of_apartments_future'])).toEqual([
      'residences_before_1945',
      'residences_future',
    ]);
  });

  it('labels a period breakdown by its types', () => {
    expect(
      names(['number_of_apartments_before_1945', 'number_of_terraced_houses_before_1945'])
    ).toEqual(['apartments', 'terraced_houses']);
  });

  it('labels the overviews', () => {
    expect(names(['number_of_apartments', 'number_of_terraced_houses'])).toEqual([
      'apartments',
      'terraced_houses',
    ]);
    expect(names(['number_of_residences_before_1945', 'number_of_residences_future'])).toEqual([
      'residences_before_1945',
      'residences_future',
    ]);
  });
});

describe('chartToCSV', () => {
  it('exports full counts as plain numbers', () => {
    const series = {
      categories: [2019, 2050],
      data: [{ name: 'number_of_apartments', data: [1_234_567, 8_512_345] }],
      formatter: () => '8.5 M',
      tableFormatter: (value: number) => `${value.toLocaleString('en-US')} #`,
      converter: (value: number) => value,
    };

    expect(chartToCSV(series, (key: string) => key)).toEqual(
      'Subject,Units,2019,2050\napartments,#,1234567,8512345'
    );
  });
});
