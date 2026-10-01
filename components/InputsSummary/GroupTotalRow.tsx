import { ColumnEditing } from '../../store/types';
import { InputCollectionData } from '../../utils/api/types';
import { EditableColumn } from '../../utils/inputs/access';
import { indentFor } from '../../utils/inputs/layout';
import { enabledMembers, groupRefusal, groupTotal } from '../../utils/inputs/shareGroups';
import { formatInputValue } from '../../utils/inputs/vocabulary';

type Translate = (id: string) => string;

const totalClass = (held: boolean, pending: boolean): string => {
  if (held) return 'text-red-600';

  return pending ? 'text-gray-500 opacity-50' : 'text-gray-500';
};

const groupUnit = (inputs: InputCollectionData, members: string[]): string =>
  members.length > 0 ? inputs[members[0]].unit : '';

export function TotalName({
  columns,
  depth,
  editing,
  group,
  inputData,
  translate,
}: {
  columns: EditableColumn[];
  depth: number;
  editing: Record<number, ColumnEditing>;
  group: string;
  inputData: Record<number, InputCollectionData>;
  translate: Translate;
}) {
  const refusal = columns
    .map(({ sessionID }) =>
      groupRefusal(inputData[sessionID], editing[sessionID]?.refused ?? {}, group)
    )
    .find(Boolean);

  return (
    <span className="block text-gray-500" style={{ paddingLeft: indentFor(depth) }}>
      {translate('inputs.total')}
      {refusal ? <span className="ml-2 text-red-600">{refusal}</span> : null}
    </span>
  );
}

// The sum of one share group in one column
export function TotalValue({
  column,
  editing,
  group,
  held,
  inputs,
  translate,
}: {
  column: EditableColumn;
  editing: ColumnEditing;
  group: string;
  held: Set<string> | undefined;
  inputs: InputCollectionData;
  translate: Translate;
}) {
  if (!column.editable) return null;

  return (
    <span className={totalClass(held?.has(group) || false, editing.pending)}>
      {formatInputValue(
        groupTotal(inputs, editing.values, group),
        groupUnit(inputs, enabledMembers(inputs, group)),
        translate
      )}
    </span>
  );
}
