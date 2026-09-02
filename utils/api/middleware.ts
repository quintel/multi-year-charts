import { AnyAction, Dispatch, Middleware } from 'redux';

import ColumnWriter from './columnWriter';
import Connection, { fetchInputsForScenario, updateScenario } from './Connection';
import { InputValue } from './types';
import { writeStarted, writeSucceeded } from '../../store/actions';
import { AppState, TypeKeys } from '../../store/types';

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

const fetchInputs = (conn: Connection, dispatch: Dispatch<AnyAction>, getState: () => AppState) => {
  conn.setColumns(getState().columns);

  conn.fetchInputs().then((data) => {
    dispatch({
      type: TypeKeys.UPDATE_INPUT_DATA,
      payload: data,
    });
  });
};

const refetchColumn = async (
  sessionID: number,
  dispatch: Dispatch<AnyAction>,
  getState: () => AppState,
  values?: Record<string, InputValue>
) => {
  const scenario = await updateScenario(sessionID, Object.keys(getState().queries), values);
  const inputs = await fetchInputsForScenario(sessionID);

  dispatch({ type: TypeKeys.UPDATE_COLUMN_DATA, payload: { sessionID, scenario, inputs } });
};

// Our own writes don't trigger a re-read
export const isNewer = (stamp?: string, seen?: string) =>
  stamp === undefined || seen === undefined || Date.parse(stamp) > Date.parse(seen);

/**
 * Creates the writer for one column, which owns its queue.
 */
const createWriter = (sessionID: number, dispatch: Dispatch<AnyAction>, getState: () => AppState) =>
  new ColumnWriter({
    // The inputs are read back after the write
    send: (values: Record<string, InputValue>) =>
      refetchColumn(sessionID, dispatch, getState, values),

    onStart: () => dispatch(writeStarted(sessionID)),
    onSuccess: (sent) => dispatch(writeSucceeded(sessionID, sent)),
  });

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
  const writers: Record<number, ColumnWriter> = {};

  const api: Middleware =
    ({ dispatch, getState }) =>
    (next) =>
    (action) => {
      switch (action.type) {
        case TypeKeys.API_FETCH: {
          conn.setColumns(getState().columns);
          sendRequest(conn, dispatch, getState);
          break;
        }

        case TypeKeys.FETCH_INPUTS: {
          fetchInputs(conn, dispatch, getState);
          break;
        }

        case TypeKeys.REMOTE_CHANGE: {
          const { sessionID, stamp } = action.payload;
          const { columns, scenarioData } = getState() as AppState;

          if (
            columns.some((column) => column.sessionID === sessionID) &&
            isNewer(stamp, scenarioData[sessionID]?.updatedAt)
          ) {
            refetchColumn(sessionID, dispatch, getState);
          }

          break;
        }

        case TypeKeys.COMMIT_INPUT_VALUE: {
          const { sessionID, inputKey, value } = action.payload;

          // Editing requires being signed in. The grid draws no controls for a signed-out visitor
          if (getState().userID) {
            writers[sessionID] = writers[sessionID] || createWriter(sessionID, dispatch, getState);
            writers[sessionID].write(inputKey, value);
          }

          break;
        }
      }

      return next(action);
    };

  return api;
};

export default createAPIMiddleware;
