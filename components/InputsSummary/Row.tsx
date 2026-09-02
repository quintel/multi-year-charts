import sanitizeHtml from 'sanitize-html';

import { InputData, InputValue, ScenarioIndexedInputData } from '../../utils/api/types';
import { currentValue, displayUnit, formatInputValue } from '../../utils/inputs/vocabulary';
import { ColumnEditing } from '../../store/types';
import { EditableColumn } from '../../utils/inputs/access';
import { toStep } from '../../utils/inputs/coerce';
import { toneClass } from '../../utils/inputs/appearance';
import useTranslate from '../../utils/useTranslate';
import Cell from './Cell';

type Translate = (id: string) => string;

const NOT_EDITING: ColumnEditing = { pending: false, values: {} };

// The share group being worked on in one column
export interface Selection {
  sessionID: number;
  shareGroup: string;
}

interface RowProps {
  columns: EditableColumn[];
  editing: Record<number, ColumnEditing>;
  input: { name: string; group_name?: string; key: string; unit: string };
  inputData: ScenarioIndexedInputData;
  onCommitValue: (sessionID: number, inputKey: string, value: InputValue) => void;
  onSelect: (selection: Selection | null) => void;
  selection: Selection | null;
  userValues: Record<number, Record<string, InputValue>>;
}

// Never shows more precision than the input's step allows
const stepped = (value: InputValue, input: InputData): InputValue =>
  typeof value === 'number' ? toStep(value, input) : value;

function ReadOnlyCell({
  input,
  isSet,
  translate,
}: {
  input: InputData;
  isSet: boolean;
  translate: Translate;
}) {
  if (input.coupling_disabled) {
    return <span className="text-gray-400">-</span>;
  }

  return (
    <span className={toneClass(false, isSet)}>
      {formatInputValue(stepped(currentValue(input), input), input.unit, translate)}
    </span>
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
  onSelect,
  selection,
  userValues,
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
          : formatInputValue(stepped(firstInputData.default, firstInputData), unit, translate)}
      </td>

      {columns.map((column) => {
        const scenarioInput = inputData[column.sessionID][input.key];
        const columnEditing = editing[column.sessionID] || NOT_EDITING;
        const typed = columnEditing.values[input.key];
        const value = stepped(typed ?? currentValue(scenarioInput), scenarioInput);
        const editable = column.editable && !scenarioInput.coupling_disabled;
        const isSet = userValues[column.sessionID]?.[input.key] !== undefined;
        const shareGroup = scenarioInput.share_group;
        const selected =
          selection?.sessionID === column.sessionID && selection?.shareGroup === shareGroup;

        return (
          <td key={column.sessionID} className="px-2 text-right">
            {editable ? (
              <Cell
                input={scenarioInput}
                isSet={isSet}
                pending={columnEditing.pending && typed === undefined}
                selected={selected}
                translate={translate}
                value={value}
                onCommit={(next) => onCommitValue(column.sessionID, input.key, next)}
                onSelect={() =>
                  onSelect(shareGroup ? { sessionID: column.sessionID, shareGroup } : null)
                }
              />
            ) : (
              <ReadOnlyCell input={scenarioInput} isSet={isSet} translate={translate} />
            )}
          </td>
        );
      })}
    </tr>
  );
}
