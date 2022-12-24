import { AnyAction, Dispatch, Middleware } from 'redux';

import Connection from './Connection';
import { TypeKeys } from '../../store/types';
import { AppState } from '../../store/types';

/**
 * Handles fetching data from ETEngine and dispatching events back to Redux.
 */
const sendRequest = (conn: Connection, dispatch: Dispatch<AnyAction>, getState: () => AppState) => {
  const { queries } = getState() as AppState;

  conn
    .sendRequest(Object.keys(queries))
    .then((data) => {
      dispatch({
        type: TypeKeys.UPDATE_API_DATA,
        payload: data,
      });

      /**
       * @todo only dispatch if connection has no outstanding requests
       */
      return dispatch({ type: TypeKeys.API_REQUEST_FINISHED });
    })
    .catch((error) => {
      return dispatch({ type: TypeKeys.API_REQUEST_FAILED, payload: error.message });
    });
};

const fetchInputs = (conn: Connection, dispatch: Dispatch<AnyAction>) => {
  conn.fetchInputs().then((data) => {
    dispatch({
      type: TypeKeys.UPDATE_INPUT_DATA,
      payload: data,
    });
  });
};

/**
 * Creates Redux middleware which listens for actions which request data from
 * the API and triggers requests as needed. Results from ETEngine are then
 * passed into Redux via the UPDATE_API_DATA action.
 */
const createAPIMiddleware = () => {
  if (!process.env.NEXT_PUBLIC_ETENGINE_URL) {
    throw new Error(
      'Cannot create API middleware without an API URL. Please set NEXT_PUBLIC_ETENGINE_URL.'
    );
  }

  const conn = new Connection(process.env.NEXT_PUBLIC_ETENGINE_URL as string);

  const api: Middleware =
    ({ dispatch, getState }) =>
    (next) =>
    (action) => {
      switch (action.type) {
        case TypeKeys.SET_SCENARIOS: {
          conn.setScenarios(action.payload.map((id: number) => id));
          break;
        }

        case TypeKeys.API_FETCH: {
          conn.setScenarios(getState().scenarios);
          sendRequest(conn, dispatch, getState);
          break;
        }

        case TypeKeys.FETCH_INPUTS: {
          fetchInputs(conn, dispatch);
          break;
        }
      }

      return next(action);
    };

  return api;
};

export default createAPIMiddleware;
