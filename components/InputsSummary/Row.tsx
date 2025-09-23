import { ScenarioIndexedInputData } from '../../utils/api/types';
import useTranslate from '../../utils/useTranslate';
import sanitizeHtml from 'sanitize-html';

interface RowProps {
  input: { name: string; group_name?: string, key: string; unit: string };
  inputData: ScenarioIndexedInputData;
  onInputClick: (id: number, key: string) => void;
  scenarioIDs: number[];
}

/**
 * A rudimentary formatter for input values.
 */
const formatInputValue = (value: number, inputDefinition: { unit: string }, translate: Function, couplingDisabled?: boolean) => {
  const [, fraction] = value.toString().split('.');
  let precision = 0;
  let { unit } = inputDefinition;

  if (fraction) {
    precision = Math.min(fraction.length, 2);
  }

  let displayValue = typeof value === 'number' ? value.toFixed(precision) : value;
  let displayUnit = ['#', 'enum', 'weather-curves', 'boolean'].includes(unit) ? '' : unit;

  if (unit === 'boolean') {
    displayValue = value ? translate('misc.yes') : translate('misc.no');
  }

  if (couplingDisabled) {
    return '-';
  }

  return (
    <>
      {displayValue} {displayUnit}
    </>
  );
};

/**
 * Creates a single row in the table, describing an input and its values in each scenario.
 */
export default function Row({ input, inputData, onInputClick, scenarioIDs }: RowProps) {
  const translate = useTranslate();
  const firstInputData = inputData[scenarioIDs[0]][input.key];
  const allCouplingDisabled = scenarioIDs.every(
    (id) => inputData[id][input.key].coupling_disabled
  );

  if (!firstInputData || allCouplingDisabled) {
    // The input doesn't exist in ETEngine or is disabled by coupling; skip it.
    return null;
  }

  let unsanitizedInputName;
  if (input.group_name) {
    unsanitizedInputName = `${input.group_name} - ${input.name}`;
  } else {
    unsanitizedInputName = input.name;
  }

  return (
    <tr key={input.key} className="border-b border-b-gray-300">
      <td
        className="p-2 pl-8 text-left text-gray-600"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(unsanitizedInputName, { allowedTags: [ 'sub', 'sup' ]}) }}
      >
      </td>
      <td key={`input-val-present-${input.key}`} className="px-2 py-2 text-right">
        {formatInputValue(firstInputData.default, input, translate, firstInputData.coupling_disabled)}
      </td>

      {scenarioIDs.map((id) => {
        const scenarioInput = inputData[id][input.key];

        return (
          <td key={id} className="px-2 text-right">
            {
              scenarioInput.user === undefined
                ? (
                  <span className="text-gray-400">
                    {formatInputValue(scenarioInput.default, input, translate, scenarioInput.coupling_disabled)}
                  </span>
                )
                : (
                  <button
                    onClick={() => onInputClick(id, input.key)}
                    className="-my-1 -mx-2 cursor-pointer rounded py-1 px-2 text-midnight-700 hover:bg-gray-100 hover:text-midnight-900 active:bg-gray-200 active:text-midnight-900"
                  >
                    {formatInputValue(scenarioInput.user, input, translate, scenarioInput.coupling_disabled)}
                  </button>
                )
            }
          </td>
        );
      })}
    </tr>
  );
}
