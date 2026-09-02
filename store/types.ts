import {
  InputCollectionData,
  InputValue,
  ScenarioData,
  ScenarioIndexedScenarioData,
  ScenarioIndexedInputData,
} from '../utils/api/types';

/**
 * API
 */

export type QueriesList = Record<string, number>;

export enum TypeKeys {
  ADD_QUERIES = 'ADD_QUERIES',
  API_FETCH = 'API_FETCH',
  API_REQUEST_FAILED = 'API_REQUEST_FAILED',
  API_REQUEST_FINISHED = 'API_REQUEST_FINISHED',
  FETCH_INPUTS = 'FETCH_INPUTS',
  COMMIT_INPUT_VALUE = 'COMMIT_INPUT_VALUE',
  REMOTE_CHANGE = 'REMOTE_CHANGE',
  REMOVE_QUERIES = 'REMOVE_QUERIES',
  SET_COLUMNS = 'SET_COLUMNS',
  SET_USER_ID = 'SET_USER_ID',
  SWAP_QUERIES = 'SWAP_QUERIES',
  UPDATE_API_DATA = 'UPDATE_API_DATA',
  UPDATE_COLUMN_DATA = 'UPDATE_COLUMN_DATA',
  UPDATE_INPUT_DATA = 'UPDATE_INPUT_DATA',
  WRITE_STARTED = 'WRITE_STARTED',
  WRITE_SUCCEEDED = 'WRITE_SUCCEEDED',
}

/** One member of the collection, as shown in the interface. */
export interface Column {
  sessionID: number;
}

/** What a column is doing between a typed value and the engine's answer. */
export interface ColumnEditing {
  pending: boolean;
  /** Typed values the engine has not yet confirmed. */
  values: Record<string, InputValue>;
}

interface APIFetchAction {
  type: typeof TypeKeys.API_FETCH;
}

interface APIFetchInputsAction {
  type: typeof TypeKeys.FETCH_INPUTS;
}

interface APIRequestFinishedAction {
  type: typeof TypeKeys.API_REQUEST_FINISHED;
}

interface APIRequestFailedAction {
  type: typeof TypeKeys.API_REQUEST_FAILED;
  payload: string;
}

interface SetColumnsAction {
  type: typeof TypeKeys.SET_COLUMNS;
  payload: Column[];
}

interface SetUserIDAction {
  type: typeof TypeKeys.SET_USER_ID;
  payload: string | null;
}

interface CommitInputValueAction {
  type: typeof TypeKeys.COMMIT_INPUT_VALUE;
  payload: { sessionID: number; inputKey: string; value: InputValue };
}

interface WriteStartedAction {
  type: typeof TypeKeys.WRITE_STARTED;
  payload: { sessionID: number };
}

interface WriteSucceededAction {
  type: typeof TypeKeys.WRITE_SUCCEEDED;
  payload: { sessionID: number; sent: Record<string, InputValue> };
}

interface RemoteChangeAction {
  type: typeof TypeKeys.REMOTE_CHANGE;
  payload: { sessionID: number; stamp?: string };
}

interface UpdateColumnDataAction {
  type: typeof TypeKeys.UPDATE_COLUMN_DATA;
  payload: { sessionID: number; scenario?: ScenarioData; inputs?: InputCollectionData };
}

interface AddQueriesAction {
  type: typeof TypeKeys.ADD_QUERIES;
  payload: string[];
}

interface RemoveQueriesAction {
  type: typeof TypeKeys.REMOVE_QUERIES;
  payload: string[];
}

interface SwapQueriesAction {
  type: typeof TypeKeys.SWAP_QUERIES;
  payload: {
    add: string[];
    remove: string[];
  };
}

interface UpdateAPIDataAction {
  type: typeof TypeKeys.UPDATE_API_DATA;
  payload: ScenarioIndexedScenarioData;
}

interface UpdateAPIInputsAction {
  type: typeof TypeKeys.UPDATE_INPUT_DATA;
  payload: ScenarioIndexedInputData;
}

export type ActionTypes =
  | APIFetchAction
  | APIFetchInputsAction
  | APIRequestFailedAction
  | APIRequestFinishedAction
  | SetColumnsAction
  | SetUserIDAction
  | CommitInputValueAction
  | WriteStartedAction
  | WriteSucceededAction
  | RemoteChangeAction
  | UpdateColumnDataAction
  | SwapQueriesAction
  | AddQueriesAction
  | RemoveQueriesAction
  | UpdateAPIDataAction
  | UpdateAPIInputsAction;

/**
 * State
 */

export interface AppState {
  columns: Column[];
  editing: Record<number, ColumnEditing>;
  userID: string | null;
  failureReason: string | null;
  inputData: ScenarioIndexedInputData;
  requestInProgress: boolean;
  scenarioData: ScenarioIndexedScenarioData;
  queries: QueriesList;
}
