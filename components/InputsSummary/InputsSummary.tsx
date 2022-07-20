import React, { useCallback, useEffect, useReducer } from 'react';

import { connect } from 'react-redux';

import Section from './Section';

import Loading from '../Loading';
import ScenarioEditor from '../ScenarioEditor';
import { AppState } from '../../store/types';

import { ScenarioIndexedInputData, ScenarioIndexedScenarioData } from '../../utils/api/types';

import { apiFetch, fetchInputs } from '../../store/actions';
import sortScenarios from '../../utils/sortScenarios';
import useCurrentLocale from '../../utils/useCurrentLocale';

import nlInputs from '../../data/inputs/nl.json';
import enInputs from '../../data/inputs/en.json';

interface InputsSummaryProps {
  apiFetch: () => void;
  fetchInputs: () => void;
  inputData: ScenarioIndexedInputData;
  scenarioData: ScenarioIndexedScenarioData;
}

type OpenModalFunc = (scenarioID: number, inputKey: string) => void;

/**
 * Returns whether the data needed to render the InputSummary is loaded.
 */
function isDataLoaded(
  inputData: ScenarioIndexedInputData,
  scenarioData: ScenarioIndexedScenarioData
) {
  return Object.keys(inputData).length > 0 && Object.keys(scenarioData).length > 0;
}

/**
 * Component which renders a loading indicator while data is fetched.
 */
function InputSummaryLoading() {
  return (
    <div className="flex h-[400px] items-center justify-center text-gray-500">
      <Loading />
    </div>
  );
}

interface InputsTableProps {
  scenarios: InputsSummaryProps['scenarioData'];
  inputs: InputsSummaryProps['inputData'];
  openModal: OpenModalFunc;
}

function sectionHasModifiedElements(
  inputElements: { key: string }[],
  inputData: ScenarioIndexedInputData
) {
  return inputElements.some((definition) => {
    return Object.values(inputData).some((byScenario) => {
      return byScenario[definition.key] && byScenario[definition.key].hasOwnProperty('user');
    });
  });
}

/**
 * Component which renders the table of inputs.
 */
function InputsTable({ inputs, openModal, scenarios }: InputsTableProps) {
  const sortedScenarios = sortScenarios(Object.values(scenarios));
  const locale = useCurrentLocale();

  const inputList = locale === 'nl' ? nlInputs : enInputs;
  const scenarioIDs = sortedScenarios.map(({ scenario: { id } }) => id);

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b-2 border-b-gray-300">
          <th className="py-2 pr-0 text-left font-semibold">Input</th>
          <th className="w-[12%] p-2 text-right font-semibold">
            {sortedScenarios[0].scenario.startYear}
          </th>
          {sortedScenarios.map(({ scenario: { endYear } }) => (
            <th key={`year-${endYear} `} className="w-[12%] p-2 text-right last:pr-0">
              {endYear}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {inputList.map((definition, i) =>
          Section.shouldShow(definition.input_elements, inputs) ? (
            <Section
              key={definition.path.join('/')}
              slide={definition}
              inputData={inputs}
              scenarioIDs={scenarioIDs}
              onInputClick={openModal}
            />
          ) : null
        )}
      </tbody>
    </table>
  );
}

type EditorState =
  | {
      isOpen: true;
      scenarioID: number;
      inputKey: string;
    }
  | { isOpen: false };

type EditorAction =
  | {
      type: 'open';
      scenarioID: number;
      inputKey: string;
    }
  | { type: 'close' };

/**
 * Reducer used to track the state of the InputSummary modal.
 */
function reducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'open':
      return { isOpen: true, scenarioID: action.scenarioID, inputKey: action.inputKey };
    case 'close':
      return { isOpen: false };
  }
}

const initialState: EditorState = { isOpen: false };

/**
 * Shows a list of all inputs which have been modified in the loaded scenarios, with links to open
 * the scenarios allowing the user to make further adjustment.
 */
function InputsSummary({ apiFetch, fetchInputs, ...props }: InputsSummaryProps) {
  const [editorState, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // Fetch the data if it isn't already loaded.
    if (Object.values(props.inputData).length === 0) {
      fetchInputs();
    }

    if (Object.values(props.scenarioData).length === 0) {
      apiFetch();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openModal = useCallback(
    (scenarioID: number, inputKey: string) => {
      dispatch({ type: 'open', scenarioID, inputKey });
    },
    [dispatch]
  );

  const closeModal = useCallback(() => {
    fetchInputs();
    apiFetch();

    dispatch({ type: 'close' });
  }, [dispatch, fetchInputs, apiFetch]);

  return (
    <div className="container">
      {isDataLoaded(props.inputData, props.scenarioData) ? (
        <InputsTable
          inputs={props.inputData}
          scenarios={props.scenarioData}
          openModal={openModal}
        />
      ) : (
        <InputSummaryLoading />
      )}
      {editorState.isOpen ? (
        <ScenarioEditor
          endYear={props.scenarioData[editorState.scenarioID].scenario.endYear}
          onClose={closeModal}
          {...editorState}
        />
      ) : null}
    </div>
  );
}

const mapStateToProps = (state: AppState) => ({
  inputData: state.inputData,
  scenarioData: state.scenarioData,
});

export default connect(mapStateToProps, { apiFetch, fetchInputs })(InputsSummary);
