import { createStore, applyMiddleware, compose } from 'redux';

import rootReducer from './reducers';
import createAPIMiddleware from '../utils/api/middleware';

let composeEnhancers = compose;

if (typeof window !== 'undefined') {
  composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
}

export default createStore(
  rootReducer,
  undefined,
  composeEnhancers(applyMiddleware(createAPIMiddleware()))
);
