import { useRouter } from 'next/router';

import Breadcrumb, { Crumb, CrumbOption } from './Breadcrumb';

import { ChartSchema, VariantNode } from '../data/charts';
import { countLeaves, resolveVariantPath } from '../utils/charts';
import useTranslate from '../utils/useTranslate';

export default function OutputBreadcrumb({ charts }: { charts: ChartSchema[] }) {
  const router = useRouter();
  const translate = useTranslate();

  const chartSlug = [router.query.chartSlug].flat()[0];
  const variantSlugs = [router.query.variantSlug].flat().filter(Boolean) as string[];

  const chart = charts.find((candidate) => candidate.slug === chartSlug) || charts[0];
  const trail = resolveVariantPath(chart.variants, variantSlugs);

  // A variant's dropdown shows its siblings at that tier, each nested down if applicable
  const variantOptionsFor = (
    chartSlug: string,
    nodes: VariantNode[],
    parentSlugs: string[]
  ): CrumbOption[] =>
    nodes.map((node) => ({
      key: node.key,
      label: translate(`chart.variant.${node.key}`),
      href: `/charts/${chartSlug}/${[...parentSlugs, node.slug].join('/')}`,
      options: node.children?.length
        ? variantOptionsFor(chartSlug, node.children, [...parentSlugs, node.slug])
        : undefined,
    }));

  const variantCrumb = (node: VariantNode, depth: number): Crumb => {
    const siblings = depth === 0 ? chart.variants : trail[depth - 1].children || [];
    const parentSlugs = trail.slice(0, depth).map((each) => each.slug);

    return {
      key: node.key,
      label: translate(`chart.variant.${node.key}`),
      href: `/charts/${chart.slug}/${[...parentSlugs, node.slug].join('/')}`,
      selectedKey: node.key,
      options: variantOptionsFor(chart.slug, siblings, parentSlugs),
    };
  };

  // A chart's variants nest as a flyout under it (arbitrarily deep), so any chart/variant
  // combination is reachable in one hover
  const chartOptions: CrumbOption[] = charts.map((each) => ({
    key: each.slug,
    label: translate(`chart.${each.key}`),
    href: `/charts/${each.slug}/${resolveVariantPath(each.variants, [])
      .map((node) => node.slug)
      .join('/')}`,
    options: countLeaves(each.variants) > 1 ? variantOptionsFor(each.slug, each.variants, []) : undefined,
  }));

  const crumbs: Crumb[] = [
    { key: chart.slug, label: translate(`chart.${chart.key}`), options: chartOptions },
    ...(countLeaves(chart.variants) > 1
      ? trail.map((node, depth) => variantCrumb(node, depth))
      : []),
  ];

  return <Breadcrumb crumbs={crumbs} />;
}
