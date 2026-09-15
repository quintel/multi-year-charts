import Link from 'next/link';

import { Breadcrumb as AntBreadcrumb, ConfigProvider } from 'antd';
import type { BreadcrumbProps, MenuProps } from 'antd';

import { ChevronDownIcon } from '@heroicons/react/solid';

import Markup from './Markup';
import useLinkHelper from '../utils/useLinkHelper';

type Item = NonNullable<BreadcrumbProps['items']>[number];
type MenuItems = NonNullable<MenuProps['items']>;

export interface CrumbOption {
  key: string;
  label: string;
  href: string;
  group?: string;
}

export interface Crumb {
  key: string;
  label: string;
  href?: string;
  selectedKey?: string;
  options?: CrumbOption[];
}

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

function groupRuns(options: CrumbOption[]): CrumbOption[][] {
  return options.reduce<CrumbOption[][]>((runs, option) => {
    const last = runs[runs.length - 1];

    if (option.group && last && last[0].group === option.group) {
      return [...runs.slice(0, -1), [...last, option]];
    }

    return [...runs, [option]];
  }, []);
}

export default function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  const { linkTo } = useLinkHelper();

  const link = (href: string, label: string) => (
    <Link href={linkTo(href)}>
      <Markup>{label}</Markup>
    </Link>
  );

  const menuItems = (options: CrumbOption[]): MenuItems =>
    groupRuns(options).flatMap((run): MenuItems => {
      const items = run.map(({ key, label, href }) => ({ key, label: link(href, label) }));
      const { group } = run[0];

      return group ? [{ key: group, type: 'group', label: group, children: items }] : items;
    });

  const items = crumbs.map(({ key, label, href, selectedKey, options }): Item => {
    const title = href ? link(href, label) : <Markup>{label}</Markup>;

    if (!options?.length) {
      return { key, title };
    }

    return {
      key,
      title,
      dropdownProps: { placement: 'bottomLeft' },
      menu: {
        selectable: true,
        selectedKeys: [selectedKey ?? key],
        items: menuItems(options) as NonNullable<Item['menu']>['items'],
      },
    };
  });

  return (
    <ConfigProvider theme={theme}>
      <AntBreadcrumb
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
