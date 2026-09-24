import { useRouter } from 'next/router';

import Breadcrumb, { Crumb, CrumbOption } from './Breadcrumb';

import { ChartSchema } from '../data/charts';
import useTranslate from '../utils/useTranslate';

export default function OutputBreadcrumb({ charts }: { charts: ChartSchema[] }) {
  const router = useRouter();
  const translate = useTranslate();

  const slug = (key: 'chartSlug' | 'variantSlug') => {
    const value = router.query[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const chart = charts.find((candidate) => candidate.slug === slug('chartSlug')) || charts[0];
  const variant =
    chart.variants.find((candidate) => candidate.slug === slug('variantSlug')) || chart.variants[0];

  // A chart's variants for nested dropdown
  const variantOptionsFor = (schema: ChartSchema): CrumbOption[] =>
    schema.variants.map((each) => ({
      key: each.slug,
      label: translate(`chart.variant.${each.key}`),
      href: `/charts/${schema.slug}/${each.slug}`,
      group: each.group && translate(`chart.group.${each.group}`),
    }));

  const chartOptions: CrumbOption[] = charts.map((each) => ({
    key: each.slug,
    label: translate(`chart.${each.key}`),
    href: `/charts/${each.slug}/${each.variants[0].slug}`,
    options: each.variants.length > 1 ? variantOptionsFor(each) : undefined,
  }));

  const variantOptions = variantOptionsFor(chart);

  const crumbs: Crumb[] = [
    { key: chart.slug, label: translate(`chart.${chart.key}`), options: chartOptions },
  ];

  if (chart.variants.length > 1) {
    crumbs.push({
      key: variant.slug,
      label: translate(`chart.variant.${variant.key}`),
      options: variantOptions,
    });
  }

  return <Breadcrumb crumbs={crumbs} />;
}
