import { InputValue } from '../utils/api/types';
import { ActionTypes, AppState, Column, ColumnEditing, TypeKeys, QueriesList } from './types';

const NOT_EDITING: ColumnEditing = { pending: false, values: {} };

const initialState: AppState = {
  columns: [],
  editing: {},
  userID: null,
  inputData: {},
  failureReason: null,
  requestInProgress: false,
  scenarioData: {},
  queries: {},
};

/**
 * Given the current query list and count, determines how many times the named
 * queryKey is needed and increments the count by 1.
 */
const increment = (queries: QueriesList, queryKey: string): number => {
  return (queries.hasOwnProperty(queryKey) ? queries[queryKey] : 0) + 1;
};

/**
 * Given the current query list and count, determines how many times the named
 * queryKey is needed and decrements the count by 1.
 */
const decrement = (queries: QueriesList, queryKey: string): number => {
  if (!queries.hasOwnProperty(queryKey)) {
    return 0;
  }

  return Math.max(0, queries[queryKey] - 1);
};

/**
 * Given the current query list, returns a new query list with each of the named
 * keys incremented by 1.
 */
const addQueries = (queries: QueriesList, keys: string[]): QueriesList => {
  const newQueries = { ...queries };

  keys.forEach((key) => (newQueries[key] = increment(newQueries, key)));
  return newQueries;
};

/**
 * Given the current query list, returns a new query list with each of the named
 * keys decremented by 1. Any queries no longer needed are removed from the
 * list.
 */
const removeQueries = (queries: QueriesList, keys: string[]): QueriesList => {
  const newQueries = { ...queries };

  keys.forEach((key) => {
    const count = decrement(newQueries, key);

    if (count > 0) {
      newQueries[key] = count;
    } else {
      delete newQueries[key];
    }
  });

  return newQueries;
};

const orderOf = (columns: Column[], sessionID: number) =>
  columns.findIndex((column) => column.sessionID === sessionID);

const reordered = (scenarioData: AppState['scenarioData'], columns: Column[]) =>
  Object.fromEntries(
    Object.entries(scenarioData).map(([id, scenario]) => [
      id,
      { ...scenario, order: orderOf(columns, Number(id)) },
    ])
  );

const editColumn = (
  state: AppState,
  sessionID: number,
  change: (editing: ColumnEditing) => ColumnEditing
): AppState => ({
  ...state,
  editing: { ...state.editing, [sessionID]: change(state.editing[sessionID] || NOT_EDITING) },
});

const without = <T>(record: Record<string, T>, keys: string[]): Record<string, T> =>
  Object.fromEntries(Object.entries(record).filter(([key]) => !keys.includes(key)));

/**
 * A value the engine has confirmed is no longer optimistic. A key the user has typed again since
 * the request went out keeps its newer value, which is still waiting for its own answer.
 */
const confirmed = (values: Record<string, InputValue>, sent: Record<string, InputValue>) =>
  without(
    values,
    Object.keys(sent).filter((key) => values[key] === sent[key])
  );

export default function reducer(state = initialState, action: ActionTypes) {
  switch (action.type) {
    /**
     * API fetching
     */

    case TypeKeys.API_FETCH: {
      return { ...state, requestInProgress: true };
    }

    case TypeKeys.API_REQUEST_FINISHED: {
      return { ...state, requestInProgress: false, failureRason: null };
    }

    case TypeKeys.API_REQUEST_FAILED: {
      return { ...state, requestInProgress: false, failureReason: action.payload };
    }

    /**
     * Columns
     */

    case TypeKeys.SET_COLUMNS: {
      const columns = action.payload;

      return { ...state, columns, scenarioData: reordered(state.scenarioData, columns) };
    }

    case TypeKeys.SET_USER_ID: {
      return { ...state, userID: action.payload };
    }

    case TypeKeys.UPDATE_API_DATA: {
      for (const [scenarioId, scenario] of Object.entries(action.payload)) {
        scenario.order = orderOf(state.columns, Number(scenarioId));
      }

      return {
        ...state,
        scenarioData: action.payload,
      };
    }

    case TypeKeys.UPDATE_INPUT_DATA: {
      return { ...state, inputData: action.payload };
    }

    case TypeKeys.UPDATE_COLUMN_DATA: {
      const { sessionID, scenario, inputs } = action.payload;

      return {
        ...state,
        scenarioData: scenario
          ? {
              ...state.scenarioData,
              [sessionID]: { ...scenario, order: orderOf(state.columns, sessionID) },
            }
          : state.scenarioData,
        inputData: inputs ? { ...state.inputData, [sessionID]: inputs } : state.inputData,
      };
    }

    /**
     * Editing
     */

    case TypeKeys.COMMIT_INPUT_VALUE: {
      const { sessionID, inputKey, value } = action.payload;

      return editColumn(state, sessionID, (editing) => ({
        ...editing,
        values: { ...editing.values, [inputKey]: value },
      }));
    }

    case TypeKeys.WRITE_STARTED: {
      return editColumn(state, action.payload.sessionID, (editing) => ({
        ...editing,
        pending: true,
      }));
    }

    case TypeKeys.WRITE_SUCCEEDED: {
      const { sessionID, sent } = action.payload;

      return editColumn(state, sessionID, (editing) => ({
        pending: false,
        values: confirmed(editing.values, sent),
      }));
    }

    /**
     * Query tracking
     */

    case TypeKeys.ADD_QUERIES: {
      return { ...state, queries: addQueries(state.queries, action.payload) };
    }

    case TypeKeys.REMOVE_QUERIES: {
      return {
        ...state,
        queries: removeQueries(state.queries, action.payload),
      };
    }

    case TypeKeys.SWAP_QUERIES: {
      const { add, remove } = action.payload;
      return {
        ...state,
        queries: addQueries(removeQueries(state.queries, remove), add),
      };
    }

    default:
      return state;
  }
}
