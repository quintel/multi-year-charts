import useTranslate from '../../utils/useTranslate';

import { chartToCSV, scenariosToChartData } from '../../utils/charts';
import { FlattenedChartSchema } from '../../data/charts';
import { ScenarioData, ScenarioIndexedScenarioData } from '../../utils/api/types';
import { TranslateFunc } from '../../utils/LocaleContext';

function downloadAsCSV(
  chart: FlattenedChartSchema,
  scenarios: ScenarioIndexedScenarioData,
  translate: TranslateFunc
) {
  const series = scenariosToChartData(scenarios, chart.series);
  const csv = chartToCSV(series, translate);

  const el = document.createElement('a');

  let title = translate(`chart.${chart.chartKey}`);

  if (chart.numVariants > 1) {
    title += ` - ${translate(`chart.variant.${chart.variantKey}`)}`;
  }

  el.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(csv)}`);
  el.setAttribute('download', `${title}.csv`);

  el.style.display = 'none';
  document.body.appendChild(el);

  el.click();

  document.body.removeChild(el);
}

interface Props {
  chart: FlattenedChartSchema;
  scenarios: ScenarioIndexedScenarioData;
}

export default function DownloadCSVButton({ chart, scenarios }: Props) {
  const translate = useTranslate();

  const disabledClasses =
    Object.keys(scenarios).length === 0 ? 'opacity-50 pointer-events-none' : '';

  return (
    <button
      className={`${disabledClasses} -my-2 flex items-center rounded px-2 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200 active:bg-gray-300`}
      onClick={() => downloadAsCSV(chart, scenarios, translate)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="mr-1 h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
      CSV
    </button>
  );
}
