import type { NextRouter } from 'next/router';

import { grantBounceUrl, resetGrantBounce } from '../grantBounce';
import type { CollectionMember } from '../useResolvedCollection';

const member = (scenarioID: number, access?: CollectionMember['access']): CollectionMember => ({
  scenarioID,
  savedScenarioID: null,
  title: null,
  access,
});

const user = { id: '1', access: { read: [1, 3], write: [] } };

const routerWith = (query: Record<string, string> = {}) =>
  ({ pathname: '/collections/[collectionID]', query, replace: jest.fn() } as unknown as NextRouter);

beforeEach(() => {
  resetGrantBounce();
  window.history.replaceState({}, '', '/collections/42?locale=en');
});

it('sends a signed-in viewer to MyETM with the members lacking a grant at their level', () => {
  const members = [member(1), member(2), member(3, 'write'), member(4, null)];
  const url = new URL(grantBounceUrl(members, user, routerWith()) ?? '');

  expect(url.searchParams.getAll('session_ids[]')).toEqual(['2', '3']);
  expect(url.searchParams.get('return_to')).toEqual(
    'http://localhost/collections/42?locale=en&granted=1'
  );
});

it('drops the marker on the way back, and does not bounce again', () => {
  const router = routerWith({ collectionID: '42', granted: '1' });

  expect(grantBounceUrl([member(2)], user, router)).toBeNull();
  expect(router.replace).toHaveBeenCalledWith(
    { pathname: '/collections/[collectionID]', query: { collectionID: '42' } },
    undefined,
    { shallow: true }
  );
  expect(grantBounceUrl([member(2)], user, routerWith())).toBeNull();
});
