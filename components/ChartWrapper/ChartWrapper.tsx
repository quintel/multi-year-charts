import { Fragment, useContext, useEffect } from 'react';

import { connect } from 'react-redux';

import { ChevronRightIcon } from '@heroicons/react/solid';

import { AppState, ChartStyle } from '../../store/types';
import { FlattenedChartSchema } from '../../data/charts';
import { ScenarioIndexedScenarioData } from '../../utils/api/types';
import LocaleContext from '../../utils/LocaleContext';

import Chart from '../Chart';
import ChartTable from '../ChartTable';
import Loading from '../Loading';
import SessionTitle from '../SessionTitle';
import { scenariosToChartData, chartToCSV } from '../../utils/charts';

import StyleToggle from './StyleToggle';

import { addQueries, apiFetch, removeQueries } from '../../store/actions';

import DownloadCSVButton from './DownloadCSVButton';
import UnitToggle from './UnitToggle';

interface ChartWrapperProps {
  activeVariant?: string;
  addQueries: (keys: string[]) => void;
  apiFetch: () => void;
  chart: FlattenedChartSchema;
  preferredChartStyle: ChartStyle;
  removeQueries: (keys: string[]) => void;
  scenarios: ScenarioIndexedScenarioData;
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

const ChartTitle = ({
  chart,
  children,
  scenarios,
}: {
  chart: FlattenedChartSchema;
  scenarios: ScenarioIndexedScenarioData;
  children?: React.ReactNode;
}) => {
  const { translate } = useContext(LocaleContext);

  return (
    <h2 className="mb-5 flex items-center">
      <span className="flex items-center text-xl font-medium">
        <span>{translate(`chart.${chart.chartKey}`)}</span>
        {chart.numVariants > 1 ? (
          <Fragment>
            <ChevronRightIcon className="h-5 w-5 text-gray-500" />
            <span>{translate(`chart.variant.${chart.variantKey}`)}</span>
          </Fragment>
        ) : null}
      </span>
      {children}
      <div className="flex-1"></div>
      <DownloadCSVButton chart={chart} scenarios={scenarios} />
      {chart.displayAs !== 'table' ? <StyleToggle /> : null}
      <UnitToggle currentChart={chart.chartKey} />
    </h2>
  );
};

function ChartWrapper({
  addQueries,
  apiFetch,
  chart,
  preferredChartStyle,
  removeQueries,
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
    <Wrapper title={<ChartTitle chart={chart} scenarios={scenarios} />}>
      <Chart
        series={series}
        style={preferredChartStyle}
        key={`${chart.chartKey}-${preferredChartStyle}`}
      />
      <div className="py-12">
        <ChartTable series={series} colorSeries />
      </div>
    </Wrapper>
  );
}

const mapStateToProps = (state: AppState) => ({
  scenarios: state.scenarioData,
  preferredChartStyle: state.preferredChartStyle,
});

export default connect(mapStateToProps, { addQueries, apiFetch, removeQueries })(ChartWrapper);
