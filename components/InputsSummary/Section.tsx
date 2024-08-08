import React from 'react';
import { ComponentProps } from 'react';
import Row from './Row';
import { sortBy } from 'lodash';
import { ScenarioIndexedInputData } from '../../utils/api/types';
import styles from '../../styles/Section.module.css';

// Define the props for the Section component
interface SectionProps {
  inputData: ComponentProps<typeof Row>['inputData'];
  onInputClick: ComponentProps<typeof Row>['onInputClick'];
  scenarioIDs: ComponentProps<typeof Row>['scenarioIDs'];
  years: number[];  // Array of years to be displayed
  slide: {
    path: string[];
    input_elements: { name: string; group_name?: string; key: string; unit: string }[];
  };
}

// Helper function to filter input elements that have user-modified data
const modifiedInputs = (inputElements: { key: string }[], inputData: ScenarioIndexedInputData) => {
  return inputElements.filter((definition) => {
    return Object.values(inputData).some((byScenario) => {
      return byScenario[definition.key] && byScenario[definition.key].hasOwnProperty('user');
    });
  });
};

// Static method to determine if a section should be displayed based on its input elements
Section.shouldShow = (inputElements: { key: string }[], inputData: ScenarioIndexedInputData) => {
  return modifiedInputs(inputElements, inputData).length > 0;
};

// Section component definition
export default function Section({ inputData, slide, years, ...rest }: SectionProps) {
  // Filter the input elements to only include those with user-modified data
  const inputs = modifiedInputs(slide.input_elements, inputData);

  // If no inputs should be displayed, return null
  if (inputs.length === 0) {
    return null;
  }

  // Create rows for each input element
  const rows = slide.input_elements.map((element) => (
    <Row key={element.key} input={element} inputData={inputData} {...rest} />
  ));

  // Create a row to display the years
  const yearRow = (
    <tr key="years">
      <td>Year</td>
      {years.map((year, index) => (
        <td key={`year-${index}`}>{year}</td>
      ))}
    </tr>
  );

  // Sort the rows by group name
  const sortedRows = sortBy(rows, 'group_name');

  return (
    <div className={styles.tableWrapper}>
      <table>
        <tbody>
          {yearRow}
          {sortedRows}
        </tbody>
      </table>
    </div>
  );
}
