import useTranslate from '../../utils/useTranslate';

import { DownloadIcon } from '@heroicons/react/solid';

import { chartToCSV, scenariosToChartData } from '../../utils/charts';
import { FlattenedChartSchema } from '../../data/charts';
import { ScenarioIndexedScenarioData } from '../../utils/api/types';
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
      className={`${disabledClasses} -my-2 flex items-center rounded px-2 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 active:bg-gray-200`}
      onClick={() => downloadAsCSV(chart, scenarios, translate)}
    >
      <DownloadIcon className="mr-1 h-5 w-5" />
      CSV
    </button>
  );
}
