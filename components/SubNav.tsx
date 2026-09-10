import { useEffect } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/router';

import AreaInformation from './AreaInformation';
import LocaleMessage from './LocaleMessage';
import UnitToggle from './ChartWrapper/UnitToggle';
import pageGutter from './pageGutter';

import { ChartSchema } from '../data/charts';
import useLinkHelper from '../utils/useLinkHelper';
import { lastVisit, rememberVisit, Section } from '../utils/lastVisited';

const tabClass = (isActive: boolean) =>
  `rounded px-4 py-1 font-medium transition ${
    isActive ? 'bg-gray-200 text-gray-800' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
  }`;

const SubNav = ({ charts, pending }: { charts: ChartSchema[]; pending?: string | null }) => {
  const router = useRouter();
  const { linkTo } = useLinkHelper();

  const onInputs = router.pathname.endsWith('/inputs');
  const section: Section = onInputs ? 'inputs' : 'outputs';
  const inputsActive = pending ? pending.split('?')[0].endsWith('/inputs') : onInputs;
  const collection = String(router.query.collectionID ?? router.query.scenarioIDs ?? '');
  const [firstChart] = charts;

  const chartSlug = String(router.query.chartSlug ?? '');
  const currentChart = charts.find((chart) => chart.slug === chartSlug) ?? firstChart;

  // Recorded on the way out
  useEffect(() => {
    const record = () => rememberVisit(collection, section);

    router.events.on('routeChangeStart', record);
    return () => router.events.off('routeChangeStart', record);
  }, [router.events, collection, section]);

  const inputsHref = lastVisit(collection, 'inputs') || linkTo('/inputs');
  const outputsHref =
    lastVisit(collection, 'outputs') ||
    linkTo(`/charts/${firstChart.slug}/${firstChart.variants[0].slug}`);

  return (
    <div className="bg-gray-800 text-sm text-white">
      <nav id="subnav" className={`${pageGutter} flex items-center py-2`}>
        <div className="flex flex-1 justify-start">
          <AreaInformation />
        </div>

        <div className="flex gap-1 rounded bg-gray-900/40 p-1">
          <Link
            href={inputsHref}
            className={tabClass(inputsActive)}
            aria-current={inputsActive ? 'page' : undefined}
          >
            <LocaleMessage id="app.inputs" />
          </Link>
          <Link
            href={outputsHref}
            className={tabClass(!inputsActive)}
            aria-current={inputsActive ? undefined : 'page'}
          >
            <LocaleMessage id="app.outputs" />
          </Link>
        </div>

        <div className="flex flex-1 justify-end">
          {inputsActive ? null : <UnitToggle currentChart={currentChart.key} />}
        </div>
      </nav>
    </div>
  );
};

export default SubNav;
