import sanitizeHtml from 'sanitize-html';

import { ScenarioIndexedInputData } from '../../utils/api/types';
import { displayUnit, formatInputValue } from '../../utils/inputs/vocabulary';
import useTranslate from '../../utils/useTranslate';

interface RowProps {
  input: { name: string; group_name?: string; key: string; unit: string };
  inputData: ScenarioIndexedInputData;
  onInputClick: (id: number, key: string) => void;
  scenarioIDs: number[];
}

/**
 * Creates a single row in the table, describing an input and its values in each scenario.
 */
export default function Row({ input, inputData, onInputClick, scenarioIDs }: RowProps) {
  const translate = useTranslate();
  const firstInputData = inputData[scenarioIDs[0]][input.key];
  const allCouplingDisabled = scenarioIDs.every(
    (id) => inputData[id][input.key] != undefined && inputData[id][input.key].coupling_disabled
  );

  if (!firstInputData || allCouplingDisabled) {
    // The input doesn't exist in ETEngine or is disabled by coupling; skip it.
    return null;
  }

  const { unit } = firstInputData;
  const unsanitizedInputName = input.group_name
    ? `${input.group_name} - ${input.name}`
    : input.name;

  return (
    <tr className="border-b border-b-gray-300">
      <td
        className="p-2 pl-8 text-left text-gray-600"
        dangerouslySetInnerHTML={{
          __html: sanitizeHtml(unsanitizedInputName, { allowedTags: ['sub', 'sup'] }),
        }}
      ></td>
      <td className="px-2 py-2 text-right">{displayUnit(unit)}</td>
      <td className="px-2 py-2 text-right">
        {firstInputData.coupling_disabled
          ? '-'
          : formatInputValue(firstInputData.default, unit, translate)}
      </td>

      {scenarioIDs.map((id) => {
        const scenarioInput = inputData[id][input.key];

        return (
          <td key={id} className="px-2 text-right">
            {scenarioInput.coupling_disabled ? (
              <span className="text-gray-400">-</span>
            ) : scenarioInput.user === undefined ? (
              <span className="text-gray-400">
                {formatInputValue(scenarioInput.default, unit, translate)}
              </span>
            ) : (
              <button
                onClick={() => onInputClick(id, input.key)}
                className="-mx-2 -my-1 cursor-pointer rounded px-2 py-1 text-midnight-700 hover:bg-gray-100 hover:text-midnight-900 active:bg-gray-200 active:text-midnight-900"
              >
                {formatInputValue(scenarioInput.user, unit, translate)}
              </button>
            )}
          </td>
        );
      })}
    </tr>
  );
}
