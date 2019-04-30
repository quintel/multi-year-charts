import { ActionTypes, AppState, TypeKeys, QueriesList } from './types';

const initialState: AppState = {
  inputData: {},
  requestInProgress: false,
  scenarioData: {},
  scenarios: [],
  queries: {}
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

  keys.forEach(key => (newQueries[key] = increment(newQueries, key)));
  return newQueries;
};

/**
 * Given the current query list, returns a new query list with each of the named
 * keys decremented by 1. Any queries no longer needed are removed from the
 * list.
 */
const removeQueries = (queries: QueriesList, keys: string[]): QueriesList => {
  const newQueries = { ...queries };

  keys.forEach(key => {
    const count = decrement(newQueries, key);

    if (count > 0) {
      newQueries[key] = count;
    } else {
      delete newQueries[key];
    }
  });

  return newQueries;
};

export default function(state = initialState, action: ActionTypes) {
  switch (action.type) {
    /**
     * API fetching
     */

    case TypeKeys.API_FETCH: {
      return { ...state, requestInProgress: true };
    }

    case TypeKeys.API_REQUEST_FINISHED: {
      return { ...state, requestInProgress: false };
    }

    /**
     * API scenarios
     */

    case TypeKeys.SET_SCENARIOS: {
      return { ...state, scenarios: action.payload };
    }

    case TypeKeys.UPDATE_API_DATA: {
      return {
        ...state,
        scenarioData: action.payload
      };
    }

    case TypeKeys.UPDATE_INPUT_DATA: {
      return { ...state, inputData: action.payload };
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
        queries: removeQueries(state.queries, action.payload)
      };
    }

    case TypeKeys.SWAP_QUERIES: {
      const { add, remove } = action.payload;
      return {
        ...state,
        queries: addQueries(removeQueries(state.queries, remove), add)
      };
    }

    default:
      return state;
  }
}
