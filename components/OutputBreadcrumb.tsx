import Link from 'next/link';
import { useRouter } from 'next/router';

import { Breadcrumb, ConfigProvider } from 'antd';
import type { BreadcrumbProps, MenuProps } from 'antd';

import { ChevronDownIcon } from '@heroicons/react/solid';

import { ChartSchema } from '../data/charts';
import useLinkHelper from '../utils/useLinkHelper';
import useTranslate from '../utils/useTranslate';

type Crumb = NonNullable<BreadcrumbProps['items']>[number];
type MenuItems = NonNullable<MenuProps['items']>;
type Variant = ChartSchema['variants'][number];

const theme = {
  token: { fontFamily: 'inherit' },
  components: {
    Breadcrumb: {
      fontSize: 20,
      fontHeight: 30,
      itemColor: '#4b5563',
      lastItemColor: '#1f2937',
    },
  },
};

function groupVariants(variants: Variant[]): Variant[][] {
  return variants.reduce<Variant[][]>((sections, variant) => {
    const last = sections[sections.length - 1];

    if (variant.group && last && last[0].group === variant.group) {
      return [...sections.slice(0, -1), [...last, variant]];
    }

    return [...sections, [variant]];
  }, []);
}

export default function OutputBreadcrumb({ charts }: { charts: ChartSchema[] }) {
  const router = useRouter();
  const translate = useTranslate();
  const { linkTo } = useLinkHelper();

  const slug = (key: 'chartSlug' | 'variantSlug') => [router.query[key]].flat()[0];

  const chart = charts.find((candidate) => candidate.slug === slug('chartSlug')) || charts[0];
  const variant =
    chart.variants.find((candidate) => candidate.slug === slug('variantSlug')) || chart.variants[0];

  const item = (href: string, key: string, label: string): MenuItems[number] => ({
    key,
    label: <Link href={linkTo(href)}>{label}</Link>,
  });

  const variantSection = (section: Variant[]): MenuItems => {
    const items = section.map((each) =>
      item(`/charts/${chart.slug}/${each.slug}`, each.slug, translate(`chart.variant.${each.key}`))
    );
    const group = section[0].group;

    if (!group) {
      return items;
    }

    return [
      { key: group, type: 'group', label: translate(`chart.group.${group}`), children: items },
    ];
  };

  const crumb = (title: string, selected: string, items: MenuItems): Crumb => ({
    key: selected,
    title,
    // Drops each menu from the left edge of its crumb rather than centering
    dropdownProps: { placement: 'bottomLeft' },
    menu: {
      selectable: true,
      selectedKeys: [selected],
      items: items as NonNullable<Crumb['menu']>['items'],
    },
  });

  const chartItems = charts.map((each) =>
    item(`/charts/${each.slug}/${each.variants[0].slug}`, each.slug, translate(`chart.${each.key}`))
  );

  const items = [crumb(translate(`chart.${chart.key}`), chart.slug, chartItems)];

  if (chart.variants.length > 1) {
    const variantItems = groupVariants(chart.variants).flatMap(variantSection);

    items.push(crumb(translate(`chart.variant.${variant.key}`), variant.slug, variantItems));
  }

  return (
    <ConfigProvider theme={theme}>
      <Breadcrumb
        separator=""
        classNames={{ root: 'font-semibold', item: 'mr-4 cursor-pointer last:mr-0' }}
        items={items}
        dropdownIcon={
          <ChevronDownIcon aria-hidden className="ml-1 inline-block h-4 w-4 align-middle" />
        }
      />
    </ConfigProvider>
  );
}
