import React, { Fragment, forwardRef, ForwardedRef } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/router';

import { Menu, Transition } from '@headlessui/react';

import LocaleMessage from './LocaleMessage';
import NavLink from './NavLink';

import { ChartSchema } from '../data/charts';
import useIsActiveURL from '../utils/useIsActiveURL';
import useLinkHelper from '../utils/useLinkHelper';

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
        className="my-3 rounded py-1 px-2 font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
        activeClassName="!text-slate-800 bg-slate-200 hover:!bg-slate-200"
      >
        <LocaleMessage id={`chart.${chart.key}`} />
      </NavLink>
    </Link>
  );
};

const MultiVariantChartItem = ({ chart }: { chart: ChartSchema }) => {
  const { linkTo } = useLinkHelper();

  let prevGroup: string | undefined = undefined;
  let isActive = useIsActiveURL(linkTo(`/charts/${chart.slug}`));

  const variantItems = chart.variants.map((variant) => {
    const url = linkTo(`/charts/${chart.slug}/${variant.slug}`);
    let group = null;

    if (prevGroup !== variant.group) {
      group = (
        <Fragment>
          <hr className="my-1.5 h-px border-slate-300" />
          <h6 className="ml-6 block px-5 pt-2 pb-1 text-xs font-medium uppercase text-slate-400">
            <LocaleMessage id={`chart.group.${variant.group}`} />
          </h6>
        </Fragment>
      );
    }

    prevGroup = variant.group;

    return (
      <Fragment key={url}>
        {group}
        <Menu.Item>
          <MenuLink
            href={url}
            className="mx-2 flex items-center whitespace-nowrap rounded py-1 pl-2 pr-16 text-slate-600 hover:bg-midnight-500 hover:text-white"
            activeClassName="!text-emerald-600 hover:!bg-transparent pointer-events-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="current-page-check mr-2 h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <div className="inactive-page-spacer mr-2 h-px w-5"></div>
            <LocaleMessage id={`chart.variant.${variant.key}`} />
          </MenuLink>
        </Menu.Item>
      </Fragment>
    );
  });

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="group my-3 flex items-center rounded py-1 px-2 font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white">
        <span
          className={`-my-1 -ml-2 mr-0 inline-block rounded py-1 pl-2 ${
            isActive ? 'bg-slate-200 !text-slate-800' : ''
          }`}
        >
          <span
            className={`border-r border-r-slate-600 pr-2 ${isActive ? 'border-r-transparent' : ''}`}
          >
            <LocaleMessage id={`chart.${chart.key}`} />
          </span>
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="-my-1 -mr-1 ml-1 h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-125"
        enterFrom="transform opacity-0 scale-90"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-200"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 z-10 mt-2 origin-center rounded-md bg-white bg-opacity-[100%] py-2 font-medium text-slate-200 shadow-lg ring-1 ring-black ring-opacity-5 backdrop-blur-sm focus:outline-none">
          {variantItems}
        </Menu.Items>
      </Transition>
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
    <div className="bg-slate-800 text-sm text-white">
      <nav id="subnav" className="container mx-auto flex gap-3">
        {charts.map(chartItem)}
        <Link href={linkTo('/inputs')} passHref>
          <NavLink
            className="my-3 ml-auto flex items-center rounded py-1 px-2 font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white"
            activeClassName="!text-slate-800 bg-slate-200 hover:!bg-slate-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-1 h-5 w-5 rotate-90"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
            </svg>
            <LocaleMessage id="app.sliderSettings" />
          </NavLink>
        </Link>
      </nav>
    </div>
  );
};

export default SubNav;
