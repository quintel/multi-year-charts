import { renderHook, waitFor } from '@testing-library/react';

import useResolvedCollection, { scenarioIDsFromQuery } from '../useResolvedCollection';

let query: Record<string, string | string[]> = {};
let isReady = true;

jest.mock('next/router', () => ({
  useRouter: () => ({ query, isReady }),
}));

beforeEach(() => {
  query = {};
  isReady = true;
  global.fetch = jest.fn();
});

describe('scenarioIDsFromQuery', () => {
  it('parses a comma-separated list', () => {
    expect(scenarioIDsFromQuery('1,2')).toEqual([1, 2]);
  });

  it('returns nothing when any id is not a number', () => {
    expect(scenarioIDsFromQuery('1,a')).toEqual([]);
    expect(scenarioIDsFromQuery('a1')).toEqual([]);
  });
});

describe('the legacy scenario-ids route', () => {
  it('resolves the ids and title from the URL', () => {
    query = { scenarioIDs: '1,2', title: 'From the URL' };

    const { result } = renderHook(() => useResolvedCollection());

    expect(result.current.status).toEqual('ready');
    expect(result.current.collection).toEqual({
      id: null,
      title: 'From the URL',
      scenarioIDs: [1, 2],
    });
  });

  it('is not found when the ids do not parse', () => {
    query = { scenarioIDs: 'nonsense' };

    expect(renderHook(() => useResolvedCollection()).result.current.status).toEqual('notFound');
  });

  it('does not call the API', () => {
    query = { scenarioIDs: '1,2' };
    renderHook(() => useResolvedCollection());

    expect(global.fetch).not.toHaveBeenCalled();
  });

  // Callers put the result into the store, so an unstable reference would dispatch on every
  // render and the resulting state change would render again.
  it('returns the same resolution across re-renders', () => {
    query = { scenarioIDs: '1,2', title: 'A title' };

    const { result, rerender } = renderHook(() => useResolvedCollection());
    const first = result.current;
    rerender();

    expect(result.current).toBe(first);
  });
});

describe('the collection route', () => {
  const respondWith = (ok: boolean, body: unknown = {}) => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok, json: async () => body });
  };

  it('resolves the title and scenario ids from the API', async () => {
    query = { collectionID: '42' };
    respondWith(true, { id: 42, title: 'From the API', scenarios: [{ scenario_id: 3 }, { scenario_id: 4 }] });

    const { result } = renderHook(() => useResolvedCollection());

    await waitFor(() => expect(result.current.status).toEqual('ready'));
    expect(result.current.collection).toEqual({
      id: 42,
      title: 'From the API',
      scenarioIDs: [3, 4],
    });
  });

  it('ignores a title in the URL', async () => {
    query = { collectionID: '42', title: 'Spoofed' };
    respondWith(true, { id: 42, title: 'Real', scenarios: [{ scenario_id: 3 }] });

    const { result } = renderHook(() => useResolvedCollection());

    await waitFor(() => expect(result.current.collection?.title).toEqual('Real'));
  });

  it('is not found when the collection cannot be read', async () => {
    query = { collectionID: '42' };
    respondWith(false, { errors: ['Not found'] });

    const { result } = renderHook(() => useResolvedCollection());

    await waitFor(() => expect(result.current.status).toEqual('notFound'));
  });

  it('is not found when the collection has no readable scenarios', async () => {
    query = { collectionID: '42' };
    respondWith(true, { id: 42, title: 'Empty', scenarios: [] });

    const { result } = renderHook(() => useResolvedCollection());

    await waitFor(() => expect(result.current.status).toEqual('notFound'));
  });

  it('is not found when the request fails', async () => {
    query = { collectionID: '42' };
    (global.fetch as jest.Mock).mockRejectedValue(new Error('offline'));

    const { result } = renderHook(() => useResolvedCollection());

    await waitFor(() => expect(result.current.status).toEqual('notFound'));
  });
});

describe('a URL naming no collection', () => {
  it('waits while the router is still populating its params', () => {
    isReady = false;

    expect(renderHook(() => useResolvedCollection()).result.current.status).toEqual('loading');
  });

  it('is not found once the router is ready', () => {
    expect(renderHook(() => useResolvedCollection()).result.current.status).toEqual('notFound');
  });
});
