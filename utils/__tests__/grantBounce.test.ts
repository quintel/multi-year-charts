import type { NextRouter } from 'next/router';

import { grantBounceUrl, resetGrantBounce, settleGrantBounce } from '../grantBounce';

const user = { id: '1', access: { read: [1, 3], write: [] } };

const routerWith = (query: Record<string, string> = {}) =>
  ({
    pathname: '/[scenarioIDs]/inputs',
    query: { scenarioIDs: '1,2,3', ...query },
    replace: jest.fn(),
  } as unknown as NextRouter);

beforeEach(() => {
  resetGrantBounce();
  window.history.replaceState({}, '', '/1,2,3/inputs?locale=en');
});

it('sends a signed-in viewer the engine refused to MyETM with the members lacking a grant', () => {
  const url = new URL(grantBounceUrl('404', user, routerWith()) ?? '');

  expect(url.searchParams.getAll('session_ids[]')).toEqual(['2']);
  expect(url.searchParams.get('return_to')).toEqual(
    'http://localhost/1,2,3/inputs?locale=en&granted=1'
  );
});

it('bounces only once per page load', () => {
  expect(grantBounceUrl('404', user, routerWith())).not.toBeNull();
  expect(grantBounceUrl('404', user, routerWith())).toBeNull();
});

it('does not bounce while the engine refuses nothing', () => {
  expect(grantBounceUrl(null, user, routerWith())).toBeNull();
});

it('does not bounce when the engine fails for another reason', () => {
  expect(grantBounceUrl('500', user, routerWith())).toBeNull();
});

it('does not bounce a signed-out visitor', () => {
  expect(grantBounceUrl('404', null, routerWith())).toBeNull();
});

it('does not bounce when the cookie already holds a grant on every member', () => {
  const granted = { ...user, access: { read: [1, 2, 3], write: [] } };

  expect(grantBounceUrl('404', granted, routerWith())).toBeNull();
});

it('drops the marker on the way back, and then shows the refusal without bouncing', () => {
  const router = routerWith({ granted: '1' });
  settleGrantBounce(router);

  expect(router.replace).toHaveBeenCalledWith(
    { pathname: '/[scenarioIDs]/inputs', query: { scenarioIDs: '1,2,3' } },
    undefined,
    { shallow: true }
  );
  expect(grantBounceUrl('404', user, routerWith())).toBeNull();
});

it('leaves a page without the marker alone', () => {
  const router = routerWith();
  settleGrantBounce(router);

  expect(router.replace).not.toHaveBeenCalled();
});
