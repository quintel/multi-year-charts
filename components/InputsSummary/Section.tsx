import { ComponentProps } from 'react';
import Row from './Row';

import { ScenarioIndexedInputData } from '../../utils/api/types';

interface SectionProps {
  inputData: ComponentProps<typeof Row>['inputData'];
  onInputClick: ComponentProps<typeof Row>['onInputClick'];
  scenarioIDs: ComponentProps<typeof Row>['scenarioIDs'];
  slide: {
    path: string[];
    input_elements: { name: string; key: string; unit: string }[];
  };
}

/**
 * Given a slide, returns a list of input definitions representing inputs for which the scenario
 * creator has specified a custom value.
 *
 * @todo If the inputs belong to share group, the whole group must be returned even when values have
 *       not been changed.
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
export default function Section({ inputData, slide, ...rest }: SectionProps) {
  const inputs = modifiedInputs(slide.input_elements, inputData);

  if (inputs.length === 0) {
    return null;
  }

  return (
    <>
      <tr className="border-b border-b-gray-300">
        <th colSpan={6} className="py-2 text-left font-semibold">
          {slide.path.join(' → ')}
        </th>
      </tr>
      {slide.input_elements.map((element) => (
        <Row key={element.key} input={element} inputData={inputData} {...rest} />
      ))}
    </>
  );
}
