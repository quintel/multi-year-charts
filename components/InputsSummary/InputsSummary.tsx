import React, { useCallback, useEffect, useReducer } from 'react';
import { connect } from 'react-redux';
import InputsTable from './InputsTable';
import Loading from '../Loading';
import ScenarioEditor from '../ScenarioEditor';
import { AppState } from '../../store/types';
import { ScenarioIndexedInputData, ScenarioIndexedScenarioData } from '../../utils/api/types';
import { apiFetch, fetchInputs } from '../../store/actions';
import useInputDefinitions from '../../utils/etmodel/useInputDefinitions';

interface InputsSummaryProps {
  apiFetch: () => void;
  fetchInputs: () => void;
  inputData: ScenarioIndexedInputData;
  scenarioData: ScenarioIndexedScenarioData;
}

type OpenModalFunc = (scenarioID: number, inputKey?: string) => void;

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

type EditorState =
  | {
      isOpen: true;
      scenarioID: number;
      inputKey: string | undefined;
    }
  | { isOpen: false };

type EditorAction =
  | {
      type: 'open';
      scenarioID: number;
      inputKey: string | undefined;
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
 * Shows a list of all inputs in the loaded scenarios, with links to open
 * the scenarios allowing the user to make further adjustment.
 */
function InputsSummary({ apiFetch, fetchInputs, ...props }: InputsSummaryProps) {
  const inputList = useInputDefinitions();

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
    (scenarioID: number, inputKey?: string) => {
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
      {inputList && isDataLoaded(props.inputData, props.scenarioData) ? (
        <InputsTable
          inputs={props.inputData}
          scenarios={props.scenarioData}
          openModal={openModal}
          inputList={inputList}
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
