import reducer from '../reducers';
import { TypeKeys } from '../types';

const failed = reducer(undefined, { type: TypeKeys.API_REQUEST_FAILED, payload: '404' } as any);

it('records why a request failed', () => {
  expect(failed.failureReason).toEqual('404');
});

// The key was misspelled, so the failure was written but never cleared and the app stayed on the
// not-found page for the rest of the session.
it('clears the failure once a request succeeds', () => {
  const finished = reducer(failed, { type: TypeKeys.API_REQUEST_FINISHED } as any);

  expect(finished.failureReason).toBeNull();
});
