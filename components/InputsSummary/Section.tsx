import { ComponentProps, Fragment } from 'react';
import GroupTotalRow from './GroupTotalRow';
import Row from './Row';

import { ScenarioIndexedInputData } from '../../utils/api/types';

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

/**
 * Given a slide, returns a list of input definitions representing inputs for which the scenario
 * creator has specified a custom value.
 */
const modifiedInputs = (inputElements: { key: string }[], inputData: ScenarioIndexedInputData) => {
  return inputElements.filter((definition) => {
    return Object.values(inputData).some((byScenario) => {
      return byScenario[definition.key] && byScenario[definition.key].hasOwnProperty('user');
    });
  });
};

/**
 * Allows a parent component to avoid rendering a section if it has no modified inputs.
 */
Section.shouldShow = (inputElements: { key: string }[], inputData: ScenarioIndexedInputData) => {
  return modifiedInputs(inputElements, inputData).length > 0;
};

/**
 * Outputs a table of each input element in a section ("slide" in ETM nomenclature) which has a
 * user-modified value.
 */
export default function Section({ slide, ...rest }: SectionProps) {
  const { columns, editing, held, inputData, selection } = rest;
  const groupOf = (key: string) => inputData[columns[0].sessionID][key]?.share_group;

  const rows = slide.input_elements.map((element, index) => {
    const group = groupOf(element.key);
    const opensGroup = group !== undefined && group !== groupOf(slide.input_elements[index - 1]?.key);

    return (
      <Fragment key={element.key}>
        {opensGroup && (
          <GroupTotalRow
            columns={columns}
            editing={editing}
            group={group}
            held={held}
            inputData={inputData}
            selection={selection}
          />
        )}
        <Row input={element} {...rest} />
      </Fragment>
    );
  });

  return <>{rows}</>;
}
