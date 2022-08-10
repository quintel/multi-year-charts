import { ScenarioIndexedInputData } from '../../utils/api/types';

interface RowProps {
  input: { name: string; key: string; unit: string };
  inputData: ScenarioIndexedInputData;
  onInputClick: (id: number, key: string) => void;
  scenarioIDs: number[];
}

/**
 * A rudimentary formatter for input values.
 */
const formatInputValue = (value: number, inputDefinition: { unit: string }) => {
  const [, fraction] = value.toString().split('.');
  let precision = 0;
  let { unit } = inputDefinition;

  if (fraction) {
    precision = Math.min(fraction.length, 2);
  }

  if (unit === '#' || unit === 'enum' || unit === 'weather-curves') {
    unit = '';
  }

  return (
    <>
      {typeof value === 'number' ? value.toFixed(precision) : value} {unit}
    </>
  );
};

/**
 * Creates a single row in the table, describing an input and its values in each scenario.
 */
export default function Row({ input, inputData, onInputClick, scenarioIDs }: RowProps) {
  const firstInputData = inputData[scenarioIDs[0]][input.key];

  if (!firstInputData) {
    // The input doesn't exist in ETEngine; skip it.
    return null;
  }

  return (
    <tr key={input.key} className="border-b border-b-gray-300">
      <td className="text-left text-gray-600">{input.name}</td>
      <td key={`input-val-present-${input.key}`} className="px-2 py-2 text-right">
        {formatInputValue(firstInputData.default, input)}
      </td>

      {scenarioIDs.map((id) => {
        const scenarioInput = inputData[id][input.key];

        return (
          <td key={id} className="px-2 text-right last:pr-0">
            {scenarioInput.user === undefined ? (
              <span className="text-gray-400">
                {formatInputValue(scenarioInput.default, input)}
              </span>
            ) : (
              <button
                onClick={() => onInputClick(id, input.key)}
                className="-my-1 -mx-2 cursor-pointer rounded py-1 px-2 text-midnight-700 hover:bg-gray-100 hover:text-midnight-900 active:bg-gray-200 active:text-midnight-900"
              >
                {formatInputValue(scenarioInput.user, input)}
              </button>
            )}
          </td>
        );
      })}
    </tr>
  );
}
