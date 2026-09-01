import { ActionTypes, Column, TypeKeys } from './types';

/**
 * Adds one or more query keys to the list of queries which should be fetched
 * from ETEngine.
 */
export const addQueries = (queries: string[]): ActionTypes => ({
  type: TypeKeys.ADD_QUERIES,
  payload: queries,
});

/**
 * Removes one or more query keys from the list of queries which should be
 * fetched from ETEngine.
 */
export const removeQueries = (queries: string[]): ActionTypes => ({
  type: TypeKeys.REMOVE_QUERIES,
  payload: queries,
});

/**
 * Sets the collection's columns, which is also the list of scenarios fetched from ETEngine
 */
export const setColumns = (columns: Column[]): ActionTypes => ({
  type: TypeKeys.SET_COLUMNS,
  payload: columns,
});

/** The signed-in user. Editing needs one. */
export const setUserID = (userID: string | null): ActionTypes => ({
  type: TypeKeys.SET_USER_ID,
  payload: userID,
});

/**
 * Receives a list of queries to be fetched from ETEngine, and queries which
 * should no longer be fetched from ETEngine and sets the state in one action.
 */
export const swapQueries = (add: string[], remove: string[]): ActionTypes => ({
  type: TypeKeys.SWAP_QUERIES,
  payload: { add, remove },
});

/**
 * Requests a fresh set of data from the ETEngine API.
 */
export const apiFetch = (): ActionTypes => ({
  type: TypeKeys.API_FETCH,
});

/**
 * Requests the list of inputs and values from the ETEngine API.
 */
export const fetchInputs = (): ActionTypes => ({
  type: TypeKeys.FETCH_INPUTS,
});
