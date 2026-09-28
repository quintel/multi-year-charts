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

it('drops the data of a session no column reads any more', () => {
  const withData = {
    ...reducer(undefined, { type: '' } as any),
    scenarioData: { 101: { order: 0 }, 5: { order: 1 } } as any,
  };

  const repointed = reducer(withData, {
    type: TypeKeys.SET_COLUMNS,
    payload: [{ sessionID: 202 }, { sessionID: 5 }],
  });

  expect(Object.keys(repointed.scenarioData)).toEqual(['5']);
  expect(repointed.scenarioData[5].order).toEqual(1);
});
