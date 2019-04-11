import { AnyAction, Dispatch, Middleware } from 'redux';

import Connection from './Connection';
import { ScenarioIDData, TypeKeys } from '../../store/types';
import { AppState } from '../../store/reducers';

/**
 * Handles fetching data from ETEngine and dispatching events back to Redux.
 */
const sendRequest = (
  conn: Connection,
  dispatch: Dispatch<AnyAction>,
  getState: () => AppState
) => {
  const { queries } = getState() as AppState;

  conn.sendRequest(Object.keys(queries)).then(data => {
    dispatch({
      type: TypeKeys.UPDATE_API_DATA,
      payload: data
    });

    /**
     * @todo only dispatch if connection has no outstanding requests
     */
    return dispatch({ type: TypeKeys.API_REQUEST_FINISHED });
  });
};

/**
 * Creates Redux middleware which listens for actions which request data from
 * the API and triggers requests as needed. Results from ETEngine are then
 * passed into Redux via the UPDATE_API_DATA action.
 */
const createAPIMiddleware = () => {
  const conn = new Connection(process.env.REACT_APP_ETENGINE_URL as string);

  const api: Middleware = ({ dispatch, getState }) => next => action => {
    switch (action.type) {
      case TypeKeys.SET_SCENARIOS: {
        conn.setScenarios(action.payload.map((s: ScenarioIDData) => s.id));
        break;
      }

      case TypeKeys.API_FETCH: {
        sendRequest(conn, dispatch, getState);
        break;
      }
    }

    return next(action);
  };

  return api;
};

export default createAPIMiddleware;
