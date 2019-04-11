import { createStore, applyMiddleware, compose } from 'redux';

import rootReducer from './reducers';
import createAPIMiddleware from '../utils/api/middleware';

const composeEnhancers =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default createStore(
  rootReducer,
  undefined,
  composeEnhancers(applyMiddleware(createAPIMiddleware()))
);
