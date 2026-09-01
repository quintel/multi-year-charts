import sanitizeHtml from 'sanitize-html';

import { InputData, InputValue, ScenarioIndexedInputData } from '../../utils/api/types';
import { currentValue, displayUnit, formatInputValue } from '../../utils/inputs/vocabulary';
import { ColumnEditing } from '../../store/types';
import { EditableColumn } from '../../utils/inputs/access';
import useTranslate from '../../utils/useTranslate';
import Cell from './Cell';

type Translate = (id: string) => string;

const NOT_EDITING: ColumnEditing = { values: {} };

interface RowProps {
  columns: EditableColumn[];
  editing: Record<number, ColumnEditing>;
  input: { name: string; group_name?: string; key: string; unit: string };
  inputData: ScenarioIndexedInputData;
  onCommitValue: (sessionID: number, inputKey: string, value: InputValue) => void;
  onInputClick: (id: number, key: string) => void;
}

/**
 * A cell the user may not type into: as it rendered before typed cells, with a value the scenario
 * creator set still opening the ETModel dialog.
 */
function ReadOnlyCell({
  input,
  inputKey,
  onInputClick,
  sessionID,
  translate,
}: {
  input: InputData;
  inputKey: string;
  onInputClick: (id: number, key: string) => void;
  sessionID: number;
  translate: Translate;
}) {
  if (input.coupling_disabled) {
    return <span className="text-gray-400">-</span>;
  }

  if (input.user === undefined) {
    return (
      <span className="text-gray-400">
        {formatInputValue(input.default, input.unit, translate)}
      </span>
    );
  }

  return (
    <button
      onClick={() => onInputClick(sessionID, inputKey)}
      className="-mx-2 -my-1 cursor-pointer rounded px-2 py-1 text-midnight-700 hover:bg-gray-100 hover:text-midnight-900 active:bg-gray-200 active:text-midnight-900"
    >
      {formatInputValue(input.user, input.unit, translate)}
    </button>
  );
}

/**
 * Creates a single row in the table, describing an input and its values in each scenario.
 */
export default function Row({
  columns,
  editing,
  input,
  inputData,
  onCommitValue,
  onInputClick,
}: RowProps) {
  const translate = useTranslate();
  const firstInputData = inputData[columns[0].sessionID][input.key];
  const allCouplingDisabled = columns.every(
    ({ sessionID }) =>
      inputData[sessionID][input.key] != undefined &&
      inputData[sessionID][input.key].coupling_disabled
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

      {columns.map((column) => {
        const scenarioInput = inputData[column.sessionID][input.key];
        const columnEditing = editing[column.sessionID] || NOT_EDITING;
        const typed = columnEditing.values[input.key];
        const value = typed === undefined ? currentValue(scenarioInput) : typed;
        const editable = column.editable && !scenarioInput.coupling_disabled;

        return (
          <td key={column.sessionID} className="px-2 text-right">
            {editable ? (
              <Cell
                input={scenarioInput}
                translate={translate}
                value={value}
                onCommit={(next) => onCommitValue(column.sessionID, input.key, next)}
              />
            ) : (
              <ReadOnlyCell
                input={scenarioInput}
                inputKey={input.key}
                onInputClick={onInputClick}
                sessionID={column.sessionID}
                translate={translate}
              />
            )}
          </td>
        );
      })}
    </tr>
  );
}
