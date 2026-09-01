import React, { useCallback, useEffect, useMemo, useReducer } from 'react';
import { connect } from 'react-redux';
import InputsTable from './InputsTable';
import Loading from '../Loading';
import ScenarioEditor from '../ScenarioEditor';
import { AppState, Column, ColumnEditing } from '../../store/types';
import { ScenarioIndexedInputData, ScenarioIndexedScenarioData } from '../../utils/api/types';
import { apiFetch, commitInputValue, fetchInputs } from '../../store/actions';
import useInputDefinitions from '../../utils/etmodel/useInputDefinitions';
import { withEditability } from '../../utils/inputs/access';

interface InputsSummaryProps {
  apiFetch: () => void;
  columns: Column[];
  commitInputValue: typeof commitInputValue;
  editing: Record<number, ColumnEditing>;
  fetchInputs: () => void;
  inputData: ScenarioIndexedInputData;
  scenarioData: ScenarioIndexedScenarioData;
  userID: string | null;
}

type OpenModalFunc = (scenarioID: number, inputKey?: string) => void;

/**
 * Whether the loaded data covers every column
 */
const covers = (data: Record<number, unknown>, columns: Column[]) =>
  columns.length > 0 && columns.every(({ sessionID }) => data[sessionID]);

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

  const columns = useMemo(
    () => withEditability(props.columns, props.userID, props.inputData),
    [props.columns, props.userID, props.inputData]
  );

  useEffect(() => {
    // Fetch whatever the current columns are not covered by.
    if (!covers(props.inputData, props.columns)) {
      fetchInputs();
    }

    if (!covers(props.scenarioData, props.columns)) {
      apiFetch();
    }
  }, [props.inputData, props.scenarioData, props.columns]);

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
      {inputList &&
      covers(props.inputData, props.columns) &&
      covers(props.scenarioData, props.columns) ? (
        <InputsTable
          columns={columns}
          editing={props.editing}
          inputs={props.inputData}
          scenarios={props.scenarioData}
          onCommitValue={props.commitInputValue}
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
  columns: state.columns,
  editing: state.editing,
  inputData: state.inputData,
  scenarioData: state.scenarioData,
  userID: state.userID,
});

export default connect(mapStateToProps, { apiFetch, commitInputValue, fetchInputs })(InputsSummary);
