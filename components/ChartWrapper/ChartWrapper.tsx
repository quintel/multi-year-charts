import { useEffect, useRef, useState } from 'react';

import { connect } from 'react-redux';

import { AppState } from '../../store/types';
import charts, { FlattenedChartSchema } from '../../data/charts';
import { ScenarioIndexedScenarioData } from '../../utils/api/types';

import Chart, { ChartHandle } from '../Chart';
import ChartTable from '../ChartTable';
import Loading from '../Loading';
import LocaleMessage from '../LocaleMessage';
import OutputBreadcrumb from '../OutputBreadcrumb';
import { scenariosToChartData } from '../../utils/charts';
import { addQueries, apiFetch, removeQueries } from '../../store/actions';
import pageGutter from '../pageGutter';

import DownloadCSVButton from './DownloadCSVButton';

interface ChartWrapperProps {
  activeVariant?: string;
  addQueries: (keys: string[]) => void;
  apiFetch: () => void;
  chart: FlattenedChartSchema;
  removeQueries: (keys: string[]) => void;
  scenarios: ScenarioIndexedScenarioData;
}

const Wrapper = ({ title, children }: { title: React.ReactElement; children: React.ReactNode }) => (
  <div className={`${pageGutter} mt-6 mb-6 w-screen`}>
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

const ChartTitle = ({
  chart,
  scenarios,
  allSeriesHidden,
  onToggleAllSeries,
}: {
  chart: FlattenedChartSchema;
  scenarios: ScenarioIndexedScenarioData;
  allSeriesHidden?: boolean;
  onToggleAllSeries?: () => void;
}) => (
  <div className="mb-5 flex items-center">
    <OutputBreadcrumb charts={charts} />
    <div className="flex-1"></div>
    {onToggleAllSeries ? (
      <button
        onClick={onToggleAllSeries}
        className="group mr-2 flex items-center rounded py-1.5 px-3 text-sm font-medium text-myetm-200 bg-myetm-900 cursor-pointer transition hover:bg-myetm-910"
      >
        {allSeriesHidden ? <LocaleMessage id="series.all" /> : <LocaleMessage id="series.hide" />}
      </button>
    ) : null}
    <DownloadCSVButton chart={chart} scenarios={scenarios} />
  </div>
);

function ChartWrapper({
  addQueries,
  apiFetch,
  chart,
  removeQueries,
  scenarios,
}: ChartWrapperProps) {
  const chartRef = useRef<ChartHandle>(null);
  const [allSeriesHidden, setAllSeriesHidden] = useState(false);

  useEffect(() => {
    const series = chart.series;

    addQueries(series);
    apiFetch();

    // Remove queries when unmounted or when chart changes.
    return () => removeQueries(chart.series);
  }, [addQueries, apiFetch, chart, removeQueries]);

  if (!canRenderChart(chart, scenarios)) {
    return (
      <Wrapper title={<ChartTitle chart={chart} scenarios={{}} />}>
        <div className="mt-4 box-content flex h-[600px] w-full items-center justify-center rounded-lg bg-gray-100 pb-4 text-gray-400">
          <Loading />
        </div>
      </Wrapper>
    );
  }

  const series = scenariosToChartData(scenarios, chart.series);

  if (chart.displayAs === 'table') {
    return (
      <Wrapper title={<ChartTitle chart={chart} scenarios={scenarios} />}>
        <ChartTable series={series} />
      </Wrapper>
    );
  }

  return (
    <Wrapper
      title={
        <ChartTitle
          chart={chart}
          scenarios={scenarios}
          allSeriesHidden={allSeriesHidden}
          onToggleAllSeries={() => chartRef.current?.toggleAllSeries()}
        />
      }
    >
      <Chart
        ref={chartRef}
        series={series}
        key={chart.chartKey}
        onAllSeriesHiddenChange={setAllSeriesHidden}
      />
      <div className="py-12 overflow-x-scroll">
        <ChartTable series={series} colorSeries />
      </div>
    </Wrapper>
  );
}

const mapStateToProps = (state: AppState) => ({
  scenarios: state.scenarioData,
});

export default connect(mapStateToProps, { addQueries, apiFetch, removeQueries })(ChartWrapper);
