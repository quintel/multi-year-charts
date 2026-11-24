import Markup from '../Markup';
import Cell from './Cell';

import {
  InputCollectionData,
  InputData,
  InputValue,
  ScenarioIndexedInputData,
} from '../../utils/api/types';
import { currentValue, formatInputValue } from '../../utils/inputs/vocabulary';
import { ColumnEditing } from '../../store/types';
import { EditableColumn } from '../../utils/inputs/access';
import { toStep } from '../../utils/inputs/coerce';
import { toneClass } from '../../utils/inputs/appearance';
import { indentFor } from '../../utils/inputs/layout';
import { groupRefusal } from '../../utils/inputs/shareGroups';
import { Selection } from '../../utils/inputs/rows';
import { Slide } from '../../utils/inputs/hierarchy';

type Translate = (id: string) => string;
type InputElement = Slide['input_elements'][number];

export const NOT_EDITING: ColumnEditing = { pending: false, values: {}, refused: {} };

// Never shows more precision than the input's step allows
const stepped = (value: InputValue, input: InputData): InputValue =>
  typeof value === 'number' ? toStep(value, input) : value;

// A refusal covering a whole group belongs to the group, and is shown on its total row instead
const cellRefusal = (
  inputs: InputCollectionData,
  refused: Record<string, string>,
  inputKey: string,
  shareGroup?: string
): string | undefined =>
  shareGroup && groupRefusal(inputs, refused, shareGroup) ? undefined : refused[inputKey];

function ReadOnlyCell({
  input,
  isSet,
  translate,
}: {
  input: InputData;
  isSet: boolean;
  translate: Translate;
}) {
  return input.coupling_disabled ? (
    <span className="text-gray-400">-</span>
  ) : (
    <span className={toneClass(false, isSet)}>
      {formatInputValue(stepped(currentValue(input), input), input.unit, translate)}
    </span>
  );
}

export function InputName({ input, depth }: { input: InputElement; depth: number }) {
  return (
    <span className="block text-gray-600" style={{ paddingLeft: indentFor(depth) }}>
      <Markup>{input.name}</Markup>
    </span>
  );
}

export function InputDefault({ source, translate }: { source: InputData; translate: Translate }) {
  return (
    <span className={toneClass(false, false)}>
      {source.coupling_disabled
        ? '-'
        : formatInputValue(stepped(source.default, source), source.unit, translate)}
    </span>
  );
}

interface InputValueCellProps {
  column: EditableColumn;
  editing: ColumnEditing;
  held: Set<string> | undefined;
  input: InputElement;
  inputs: InputCollectionData;
  onCommit: (value: InputValue) => void;
  onReset: () => void;
  onSelect: (selection: Selection | null) => void;
  selection: Selection | null;
  translate: Translate;
  userValues: Record<string, InputValue>;
}

/** One scenario's value for one input: an editable control, or the value it inherited. */
export function InputValueCell({
  column,
  editing,
  held,
  input,
  inputs,
  onCommit,
  onReset,
  onSelect,
  selection,
  translate,
  userValues,
}: InputValueCellProps) {
  const scenarioInput = inputs[input.key];

  if (!scenarioInput) return null;

  const typed = editing.values[input.key];
  const value = stepped(typed ?? currentValue(scenarioInput), scenarioInput);
  const isSet = userValues[input.key] !== undefined;
  const shareGroup = scenarioInput.share_group;

  if (!column.editable || scenarioInput.coupling_disabled) {
    return <ReadOnlyCell input={scenarioInput} isSet={isSet} translate={translate} />;
  }

  const refusal = cellRefusal(inputs, editing.refused, input.key, shareGroup);

  return (
    <Cell
      input={scenarioInput}
      isSet={isSet}
      pending={editing.pending && typed === undefined}
      refusal={refusal}
      refused={refusal !== undefined}
      selected={selection?.sessionID === column.sessionID && selection?.shareGroup === shareGroup}
      held={shareGroup !== undefined && (held?.has(shareGroup) || false)}
      translate={translate}
      value={value}
      onCommit={onCommit}
      onReset={onReset}
      onSelect={() => onSelect(shareGroup ? { sessionID: column.sessionID, shareGroup } : null)}
    />
  );
}
