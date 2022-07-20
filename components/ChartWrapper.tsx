import { Fragment, useContext, useEffect } from 'react';

import { connect } from 'react-redux';

import { AppState } from '../store/types';
import { FlattenedChartSchema } from '../data/charts';
import { ScenarioIndexedScenarioData } from '../utils/api/types';
import LocaleContext, { TranslateFunc } from '../utils/LocaleContext';

import Chart from './Chart';
import ChartTable from './ChartTable';
import Loading from './Loading';
import { scenariosToChartData } from '../utils/charts';

import { addQueries, apiFetch, removeQueries } from '../store/actions';

interface ChartWrapperProps {
  activeVariant?: string;
  chart: FlattenedChartSchema;
  scenarios: ScenarioIndexedScenarioData;
  addQueries: (keys: string[]) => void;
  apiFetch: () => void;
  removeQueries: (keys: string[]) => void;
}

const Wrapper = ({ title, children }: { title: React.ReactElement; children: React.ReactNode }) => (
  <div className="container mx-auto mt-6 mb-6">
    {title}
    {children}
  </div>
);

/**
 * Returns whether the scenario data has all of the values needed to render the
 * chart.
 */
const canRenderChart = (chart: FlattenedChartSchema, scenarios: ScenarioIndexedScenarioData) => {
  const ids = Object.keys(scenarios);

  if (ids.length === 0) {
    return false;
  }

  return chart.series.every((series) =>
    ids.every((id) => scenarios[parseInt(id, 10)].gqueries.hasOwnProperty(series))
  );
};

const ChartTitle = ({ chart }: { chart: FlattenedChartSchema }) => {
  const { translate } = useContext(LocaleContext);

  return (
    <h2 className="mb-5 text-xl font-medium flex items-center">
      <span>{translate(`chart.${chart.chartKey}`)}</span>
      {chart.numVariants > 1 ? (
        <Fragment>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span>{translate(`chart.variant.${chart.variantKey}`)}</span>
        </Fragment>
      ) : null}
    </h2>
  );
};

function ChartWrapper({
  addQueries,
  apiFetch,
  removeQueries,
  chart,
  scenarios,
}: ChartWrapperProps) {
  useEffect(() => {
    const series = chart.series;

    addQueries(series);
    apiFetch();

    // Remove queries when unmounted or when chart changes.
    () => removeQueries(chart.series);
  }, [addQueries, apiFetch, chart, removeQueries]);

  if (!canRenderChart(chart, scenarios)) {
    return (
      <Wrapper title={<ChartTitle chart={chart} />}>
        <div className="mt-4 box-content flex h-[600px] w-full items-center justify-center rounded-lg bg-white pb-4 text-slate-400 shadow">
          <Loading />
        </div>
      </Wrapper>
    );
  }

  const series = scenariosToChartData(scenarios, chart.series);

  if (chart.displayAs === 'table') {
    return (
      <Wrapper title={<ChartTitle chart={chart} />}>
        <div className="bg-white shadow rounded ring-1 ring-black/5">
          <ChartTable series={series} />
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper title={<ChartTitle chart={chart} />}>
      <div className="bg-white shadow p-3 rounded ring-1 ring-black/5">
        <Chart series={series} />
      </div>
    </Wrapper>
  );
}

const mapStateToProps = (state: AppState) => ({
  scenarios: state.scenarioData,
});

export default connect(mapStateToProps, { addQueries, apiFetch, removeQueries })(ChartWrapper);
