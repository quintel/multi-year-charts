/**
 * @jest-environment node
 */
import type { NextApiRequest, NextApiResponse } from 'next';

import handler from '../../../pages/api/scenarios/[id]/inputs';
import { SESSION_COOKIE_NAME } from '../../../utils/sessionCookie';

const ENGINE = 'http://engine.test';
// Pinned in .env.test. Never assigned here: Next replaces every NEXT_PUBLIC_* read with a literal,
// so an assignment to one does not survive the production build.
const PUBLIC_ENGINE = process.env.NEXT_PUBLIC_ETENGINE_URL as string;

const makeRes = () => {
  const res: Partial<NextApiResponse> = {};
  res.status = jest.fn().mockReturnValue(res) as any;
  res.json = jest.fn().mockReturnValue(res) as any;
  res.end = jest.fn().mockReturnValue(res) as any;
  return res as NextApiResponse;
};

const reqWith = (query: Record<string, string | string[]>) =>
  ({ method: 'GET', cookies: {}, query: { id: '1', ...query } } as unknown as NextApiRequest);

const requestedURL = () => (global.fetch as jest.Mock).mock.calls[0][0] as string;

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env.ETENGINE_INTERNAL_URL = ENGINE;

  global.fetch = jest.fn().mockResolvedValue({
    status: 200,
    text: async () => JSON.stringify({ foo: {} }),
  }) as any;
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe('/api/scenarios/[id]/inputs', () => {
  it('forwards the session cookie as a bearer token', async () => {
    const req = {
      ...reqWith({}),
      cookies: { [SESSION_COOKIE_NAME]: 'a.jwt.token' },
    } as unknown as NextApiRequest;

    await handler(req, makeRes());

    expect((global.fetch as jest.Mock).mock.calls[0][1].headers.Authorization).toBe(
      'Bearer a.jwt.token'
    );
  });

  it('falls back to the public engine URL when there is no internal one', async () => {
    delete process.env.ETENGINE_INTERNAL_URL;

    await handler(reqWith({}), makeRes());

    expect(requestedURL()).toBe(
      `${PUBLIC_ENGINE}/api/v3/scenarios/1/inputs.json?defaults=original`
    );
  });
});
