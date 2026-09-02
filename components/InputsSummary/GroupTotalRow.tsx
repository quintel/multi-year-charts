import { Selection } from './Row';
import { ColumnEditing } from '../../store/types';
import { ScenarioIndexedInputData } from '../../utils/api/types';
import { EditableColumn } from '../../utils/inputs/access';
import { enabledMembers, groupRefusal, groupTotal } from '../../utils/inputs/shareGroups';
import { formatInputValue } from '../../utils/inputs/vocabulary';
import useTranslate from '../../utils/useTranslate';

const NOT_EDITING: ColumnEditing = { pending: false, values: {}, refused: {} };

interface GroupTotalRowProps {
  columns: EditableColumn[];
  editing: Record<number, ColumnEditing>;
  group: string;
  held: Record<number, Set<string>>;
  inputData: ScenarioIndexedInputData;
  selection: Selection | null;
}

const totalClass = (held: boolean, pending: boolean): string => {
  if (held) return 'text-red-600';

  return pending ? 'text-gray-500 opacity-50' : 'text-gray-500';
};

const groupUnit = (inputs: Record<string, { unit: string }>, members: string[]): string =>
  members.length > 0 ? inputs[members[0]].unit : '';

/**
 * The sum of one share group in each column directly above the relevant share group rows
 */
export default function GroupTotalRow({
  columns,
  editing,
  group,
  held,
  inputData,
  selection,
}: GroupTotalRowProps) {
  const translate = useTranslate();

  const holdingValues = columns.some(({ sessionID }) => held[sessionID]?.has(group));

  if (!columns.some((column) => column.editable)) return null;
  if (selection?.shareGroup !== group && !holdingValues) return null;

  const editingFor = (sessionID: number) => editing[sessionID] || NOT_EDITING;

  const refusal = columns
    .map(({ sessionID }) => groupRefusal(inputData[sessionID], editingFor(sessionID).refused, group))
    .find(Boolean);

  return (
    <tr className="border-b border-b-gray-300">
      <td className="p-2 pl-8 text-left text-gray-500">
        {translate('inputs.total')}
        {refusal ? <span className="ml-2 text-red-600">{refusal}</span> : null}
      </td>
      <td className="px-2 py-2"></td>
      <td className="px-2 py-2"></td>

      {columns.map((column) => {
        if (!column.editable) return <td key={column.sessionID} className="px-2"></td>;

        const inputs = inputData[column.sessionID];
        const { pending, values } = editingFor(column.sessionID);
        const isHeld = held[column.sessionID]?.has(group) || false;

        return (
          <td
            key={column.sessionID}
            className={`px-2 py-2 text-right ${totalClass(isHeld, pending)}`}
          >
            {formatInputValue(
              groupTotal(inputs, values, group),
              groupUnit(inputs, enabledMembers(inputs, group)),
              translate
            )}
          </td>
        );
      })}
    </tr>
  );
}
