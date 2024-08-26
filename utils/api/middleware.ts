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

const setScenariosFromMycID = (conn: Connection, dispatch: Dispatch<AnyAction>, getState: () => AppState) => {
  const { mycID } = getState() as AppState;

  conn.setScenariosFromMycID(mycID).then((data) => {
    dispatch({
      type: TypeKeys.SET_SCENARIOS,
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

        // TODO: trigger this, check what set sceanrio action does, make sure mycID is in appstate, done!
        case TypeKeys.FETCH_SCENARIOS: {
          setScenariosFromMycID(conn, dispatch, getState);
          break;
        }

        // case TypeKeys.SET_AND_API_FETCH {
        //   conn.setScenarios(action.payload.map((id: number) => id));
        //   sendRequest(conn, dispatch, getState);
        //   break;
        // }
      }

      return next(action);
    };

  return api;
};

export default createAPIMiddleware;
