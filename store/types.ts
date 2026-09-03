import { ScenarioIndexedScenarioData, ScenarioIndexedInputData } from '../utils/api/types';

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
  REMOVE_QUERIES = 'REMOVE_QUERIES',
  SET_COLLECTION = 'SET_COLLECTION',
  SET_SCENARIOS = 'SET_SCENARIOS',
  SWAP_QUERIES = 'SWAP_QUERIES',
  UPDATE_API_DATA = 'UPDATE_API_DATA',
  UPDATE_INPUT_DATA = 'UPDATE_INPUT_DATA',
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

interface SetScenariosAction {
  type: typeof TypeKeys.SET_SCENARIOS;
  payload: number[];
}

interface SetCollectionAction {
  type: typeof TypeKeys.SET_COLLECTION;
  payload: CollectionState;
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
  | SetScenariosAction
  | SetCollectionAction
  | SwapQueriesAction
  | AddQueriesAction
  | RemoveQueriesAction
  | UpdateAPIDataAction
  | UpdateAPIInputsAction;

/**
 * State
 */

/**
 * The collection currently being viewed. `id` is null on the legacy `/[scenarioIDs]` URLs, which
 * carry no collection.
 */
export interface CollectionState {
  id: number | null;
  title: string | null;
  // The URL named a collection we cannot show: unknown id, or not readable by this viewer.
  notFound: boolean;
}

export interface AppState {
  collection: CollectionState;
  failureReason: string | null;
  inputData: ScenarioIndexedInputData;
  requestInProgress: boolean;
  scenarios: number[];
  scenarioData: ScenarioIndexedScenarioData;
  queries: QueriesList;
}
