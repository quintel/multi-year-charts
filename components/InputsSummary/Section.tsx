import { ComponentProps, Fragment } from 'react';
import GroupTotalRow from './GroupTotalRow';
import Row from './Row';

import { stickyName } from '../../utils/inputs/layout';
import { renderableInputs } from '../../utils/inputs/visibility';

interface SectionProps {
  columns: ComponentProps<typeof Row>['columns'];
  editing: ComponentProps<typeof Row>['editing'];
  held: ComponentProps<typeof Row>['held'];
  inputData: ComponentProps<typeof Row>['inputData'];
  onCommitValue: ComponentProps<typeof Row>['onCommitValue'];
  onResetValue: ComponentProps<typeof Row>['onResetValue'];
  onSelect: ComponentProps<typeof Row>['onSelect'];
  selection: ComponentProps<typeof Row>['selection'];
  userValues: ComponentProps<typeof Row>['userValues'];
  slide: {
    path: string[];
    input_elements: { name: string; group_name?: string; key: string; unit: string }[];
  };
}

const shareGroupHeader = (group_name?: string) => {
  return (
    <tr className="border-b border-b-gray-300">
      <td className={`${stickyName} p-2 pl-8 text-left`}>
        {group_name}
      </td>
    </tr>
  )
};

/**
 * Outputs a table of each input element in a section ("slide" in ETM nomenclature) which has a
 * user-modified value.
 */
export default function Section({ slide, ...rest }: SectionProps) {
  const { columns, editing, held, inputData, selection } = rest;
  const groupOf = (key: string) => inputData[columns[0].sessionID][key]?.share_group;

  const elements = renderableInputs(slide.input_elements, inputData, columns);

  const rows = elements.map((element, index) => {
    // We can possibly simplfy this once all ETModel interface items with a share group, have
    // a interface_group set as well, passing on the translated title in group_name here
    const group = groupOf(element.key) || element.group_name;
    const group_name = element.group_name || groupOf(element.key);
    const opensGroup = group !== undefined && (
      group !== groupOf(elements[index - 1]?.key) &&
      group !== elements[index - 1]?.group_name
    );
    const closesGroup = group !== undefined && group !== groupOf(elements[index + 1]?.key);

    const groupCouplingDisabled = columns.every(
      ({ sessionID }) =>
        inputData[sessionID][element.key] != undefined &&
        inputData[sessionID][element.key].coupling_disabled
    );

    return (
      <Fragment key={element.key}>
        {opensGroup && group_name && !groupCouplingDisabled && shareGroupHeader(group_name)}

        <Row input={element} {...rest} />

        {closesGroup && !groupCouplingDisabled && (
          <GroupTotalRow
            columns={columns}
            editing={editing}
            group={group}
            held={held}
            inputData={inputData}
            selection={selection}
          />
        )}
      </Fragment>
    );
  });

  return <>{rows}</>;
}
