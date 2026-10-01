import { ScenarioIndexedInputData } from '../api/types';

type InputElement = { key: string };
type Column = { sessionID: number };

/**
 * Given a slide, returns a list of input definitions representing inputs for which the scenario
 * creator has specified a custom value.
 */
export const modifiedInputs = <T extends InputElement>(
  inputElements: T[],
  inputData: ScenarioIndexedInputData
) =>
  inputElements.filter(({ key }) =>
    Object.values(inputData).some((byScenario) => byScenario[key]?.hasOwnProperty('user'))
  );

// The inputs which will actually draw a row
export const renderableInputs = <T extends InputElement>(
  inputElements: T[],
  inputData: ScenarioIndexedInputData,
  columns: Column[]
) =>
  inputElements.filter(
    ({ key }) =>
      inputData[columns[0].sessionID][key] &&
      !columns.every(({ sessionID }) => inputData[sessionID][key]?.coupling_disabled)
  );

export const hasRows = (
  inputElements: InputElement[],
  inputData: ScenarioIndexedInputData,
  columns: Column[]
) => renderableInputs(inputElements, inputData, columns).length > 0;

export const hasEdits = (inputElements: InputElement[], inputData: ScenarioIndexedInputData) =>
  modifiedInputs(inputElements, inputData).length > 0;
