/**
 * @jest-environment node
 */
import type { NextApiRequest, NextApiResponse } from 'next';

import handler from '../../pages/api/collections/[id]';
import { SESSION_COOKIE_NAME } from '../../utils/sessionCookie';

const makeRes = () => {
  const res: Partial<NextApiResponse> = {};
  res.status = jest.fn().mockReturnValue(res) as any;
  res.json = jest.fn().mockReturnValue(res) as any;
  return res as NextApiResponse;
};

const reqWith = (cookies: Record<string, string>, id: string | string[] = '42') =>
  ({ cookies, query: { id }, method: 'GET' } as unknown as NextApiRequest);

const requestedPath = () => new URL((global.fetch as jest.Mock).mock.calls[0][0]).pathname;

const respondWith = (status: number, body: unknown) => {
  global.fetch = jest.fn().mockResolvedValue({ status, json: async () => body });
};

beforeEach(() => {
  respondWith(200, {});
});

it('forwards the session cookie to MyETM as a bearer token', async () => {
  await handler(reqWith({ [SESSION_COOKIE_NAME]: 'a-token' }), makeRes());

  const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
  expect(url).toEqual(`${process.env.NEXT_PUBLIC_MYETM_URL}/api/v1/collections/42`);
  expect(init.headers.Authorization).toEqual('Bearer a-token');
});

it('sends an empty authorization when signed out', async () => {
  await handler(reqWith({}), makeRes());

  expect((global.fetch as jest.Mock).mock.calls[0][1].headers.Authorization).toEqual('');
});

it('passes the collection through', async () => {
  respondWith(200, { id: 42, title: 'A collection', scenarios: [{ scenario_id: 1 }] });
  const res = makeRes();

  await handler(reqWith({ [SESSION_COOKIE_NAME]: 'a-token' }), res);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({
    id: 42,
    title: 'A collection',
    scenarios: [{ scenario_id: 1 }],
  });
});

it('passes a not-found through rather than masking it', async () => {
  respondWith(404, { errors: ['Not found'] });
  const res = makeRes();

  await handler(reqWith({}), res);

  expect(res.status).toHaveBeenCalledWith(404);
});

// The id lands in a URL that is then normalised, so an unencoded '..' would walk out of the
// collections path and reach another MyETM endpoint carrying the viewer's token.
it('cannot be steered onto another MyETM endpoint', async () => {
  await handler(reqWith({ [SESSION_COOKIE_NAME]: 'a-token' }, '1/../../users'), makeRes());

  expect(requestedPath()).toEqual('/api/v1/collections/1%2F..%2F..%2Fusers');
});

it('uses a single id when the query supplies several', async () => {
  await handler(reqWith({}, ['42', '43']), makeRes());

  expect(requestedPath()).toEqual('/api/v1/collections/42');
});
