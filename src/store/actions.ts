import { ActionTypes, TypeKeys, ScenarioIDData } from './types';

/**
 * Adds one or more query keys to the list of queries which should be fetched
 * from ETEngine.
 */
export const addQueries = (queries: string[]): ActionTypes => ({
  type: TypeKeys.ADD_QUERIES,
  payload: queries
});

/**
 * Removes one or more query keys from the list of queries which should be
 * fetched from ETEngine.
 */
export const removeQueries = (queries: string[]): ActionTypes => ({
  type: TypeKeys.REMOVE_QUERIES,
  payload: queries
});

/**
 * Sets the list of scenarios which are to be fetched from ETEngine.
 */
export const setScenarios = (scenarios: ScenarioIDData[]): ActionTypes => ({
  type: TypeKeys.SET_SCENARIOS,
  payload: scenarios
});

/**
 * Receives a list of queries to be fetched from ETEngine, and queries which
 * should no longer be fetched from ETEngine and sets the state in one action.
 */
export const swapQueries = (add: string[], remove: string[]): ActionTypes => ({
  type: TypeKeys.SWAP_QUERIES,
  payload: { add, remove }
});

/**
 * Requests a fresh set of data from the ETEngine API.
 */
export const apiFetch = () => ({
  type: TypeKeys.API_FETCH
});

/**
 * Requests the list of inputs and values from the ETEngine API.
 */
export const fetchInputs = () => ({
  type: TypeKeys.FETCH_INPUTS
});
