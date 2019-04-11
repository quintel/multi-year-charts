import { ScenarioData } from '../utils/api/types';

/**
 * API
 */

export interface ScenarioIDData {
  id: number;
  year: number;
}

export type QueriesList = Record<string, number>;

export enum TypeKeys {
  ADD_QUERIES = 'ADD_QUERIES',
  API_FETCH = 'API_FETCH',
  API_REQUEST_FINISHED = 'API_REQUEST_FINISHED',
  REMOVE_QUERIES = 'REMOVE_QUERIES',
  SET_SCENARIOS = 'SET_SCENARIOS',
  SWAP_QUERIES = 'SWAP_QUERIES',
  UPDATE_API_DATA = 'UPDATE_API_DATA'
}

interface APIFetchAction {
  type: typeof TypeKeys.API_FETCH;
}

interface APIRequestFinishedAction {
  type: typeof TypeKeys.API_REQUEST_FINISHED;
}

interface SetScenariosAction {
  type: typeof TypeKeys.SET_SCENARIOS;
  payload: ScenarioIDData[];
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
  payload: ScenarioData[];
}

export type ActionTypes =
  | APIFetchAction
  | APIRequestFinishedAction
  | SetScenariosAction
  | SwapQueriesAction
  | AddQueriesAction
  | RemoveQueriesAction
  | UpdateAPIDataAction;