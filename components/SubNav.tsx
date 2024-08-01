import { Fragment, forwardRef, ForwardedRef } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/router';

import { AdjustmentsIcon, ChevronDownIcon } from '@heroicons/react/solid';

import LocaleMessage from './LocaleMessage';
import Menu from './Menu';
import NavLink from './NavLink';

import { ChartSchema } from '../data/charts';
import useIsActiveURL from '../utils/useIsActiveURL';
import useLinkHelper from '../utils/useLinkHelper';
import Settings from './Settings';

const MenuLink = forwardRef(
  (
    { href, children, ...rest }: React.ComponentProps<typeof NavLink> & { href: string },
    ref: ForwardedRef<HTMLAnchorElement>
  ) => {
    return (
      <Link href={href} passHref>
        <NavLink ref={ref} {...rest}>
          {children}
        </NavLink>
      </Link>
    );
  }
);

MenuLink.displayName = 'MenuLink';

const SingleVariantChartItem = ({ chart }: { chart: ChartSchema }) => {
  const { linkTo } = useLinkHelper();

  return (
    <Link passHref key={`subnav-chart-${chart.slug}`} href={linkTo(`/charts/${chart.slug}`)}>
      <NavLink
        className="my-3 rounded py-1 px-2 font-medium text-gray-300 transition first:-ml-2 last:-mr-2 hover:bg-gray-700 hover:text-white"
        activeClassName="!text-gray-800 bg-gray-200 hover:!bg-gray-200"
      >
        <LocaleMessage id={`chart.${chart.key}`} />
      </NavLink>
    </Link>
  );
};

const MenuButton = ({ children, isActive }: { children: React.ReactNode; isActive: boolean }) => {
  return (
    <Menu.Button className="group my-3 flex items-center rounded py-1 px-2 font-medium text-gray-300 transition first:-ml-2 hover:bg-gray-700 hover:text-white">
      <span
        className={`-my-1 -ml-2 mr-0 inline-block rounded py-1 pl-2 ${
          isActive ? 'bg-gray-200 !text-gray-800' : ''
        }`}
      >
        <span
          className={`border-r border-r-gray-600 pr-2 ${isActive ? '!border-r-transparent' : ''}`}
        >
          {children}
        </span>
      </span>
      <ChevronDownIcon className="-my-1 -mr-1 ml-1 h-5 w-5" />
    </Menu.Button>
  );
};

const MultiVariantChartItem = ({ chart }: { chart: ChartSchema }) => {
  const { linkTo } = useLinkHelper();

  const isActive = useIsActiveURL(linkTo(`/charts/${chart.slug}`));

  // Get the full path so that we can show which variant is currently active in the menu.
  const router = useRouter();
  const fullPath = router.asPath;

  let prevGroup: string | undefined = undefined;

  const variantItems = chart.variants.map((variant) => {
    const url = linkTo(`/charts/${chart.slug}/${variant.slug}`);
    let group = null;

    if (prevGroup !== variant.group) {
      group = (
        <Fragment>
          <Menu.SectionHeader>
            <LocaleMessage id={`chart.group.${variant.group}`} />
          </Menu.SectionHeader>
        </Fragment>
      );
    }

    prevGroup = variant.group;

    return (
      <Fragment key={url}>
        {group}
        <Menu.SelectableItem as={MenuLink} href={url} value={url} onClick={() => {}}>
          <LocaleMessage id={`chart.variant.${variant.key}`} />
        </Menu.SelectableItem>
      </Fragment>
    );
  });

  return (
    <Menu
      button={
        <MenuButton isActive={isActive}>
          <LocaleMessage id={`chart.${chart.key}`} />
        </MenuButton>
      }
    >
      <Menu.SelectionGroup value={fullPath} onChange={() => {}}>
        {variantItems}
      </Menu.SelectionGroup>
    </Menu>
  );
};

const chartItem = (chart: ChartSchema) => {
  const key = `subnav-chart-${chart.slug}`;

  if (chart.variants.length > 1) {
    return <MultiVariantChartItem chart={chart} key={key} />;
  }

  return <SingleVariantChartItem chart={chart} key={key} />;
};

const SubNav = ({ charts }: { charts: ChartSchema[] }) => {
  const router = useRouter();
  const { linkTo } = useLinkHelper();

  return (
    <div className="bg-gray-800 text-sm text-white">
      <nav id="subnav" className="container mx-auto flex gap-3">
        {charts.map(chartItem)}
        <Link href={linkTo('/inputs')} passHref>
          <NavLink
            className="my-3 ml-auto flex items-center rounded py-1 px-2 font-medium text-gray-300 transition first:-ml-2 last:-mr-2 hover:bg-gray-700 hover:text-white"
            activeClassName="!text-gray-800 bg-gray-200 hover:!bg-gray-200"
          >
            <AdjustmentsIcon className="mr-1 h-5 w-5 rotate-90" />
            <LocaleMessage id="app.sliderSettings" />
          </NavLink>
        </Link>
        <div className="my-3 ml-2">
          <Settings />
        </div>
      </nav>
    </div>
  );
};

export default SubNav;
