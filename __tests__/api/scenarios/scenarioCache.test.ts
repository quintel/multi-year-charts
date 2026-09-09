/**
 * @jest-environment node
 */
import type { NextApiRequest, NextApiResponse } from 'next';

import handler from '../../../pages/api/scenarios/[id]';
import { reset } from '../../../utils/cache/scenarioCache';
import { SESSION_COOKIE_NAME } from '../../../utils/sessionCookie';

const ENGINE = 'http://engine.test';

const SIGNED_IN = { [SESSION_COOKIE_NAME]: 'token-for-me' };
const SOMEBODY_ELSE = { [SESSION_COOKIE_NAME]: 'token-for-you' };

const makeRes = () => {
  const res: Partial<NextApiResponse> = {};
  res.status = jest.fn().mockReturnValue(res) as any;
  res.json = jest.fn().mockReturnValue(res) as any;
  res.end = jest.fn().mockReturnValue(res) as any;
  res.setHeader = jest.fn().mockReturnValue(res) as any;
  return res as NextApiResponse;
};

const readReq = (id: string, gqueries: string[], cookies: Record<string, string> = {}) =>
  ({
    method: 'PUT',
    cookies,
    query: { id },
    body: { gqueries },
  } as unknown as NextApiRequest);

const writeReq = (id: string, gqueries: string[], cookies = SIGNED_IN) =>
  ({
    method: 'PUT',
    cookies,
    query: { id },
    body: { gqueries, scenario: { user_values: { foo: 1 } } },
  } as unknown as NextApiRequest);

const calls = () => (global.fetch as jest.Mock).mock.calls;
const headerFor = (res: NextApiResponse) =>
  (res.setHeader as jest.Mock).mock.calls.find(([name]) => name === 'X-Collections-Cache')?.[1];

const originalEnv = { ...process.env };

beforeEach(() => {
  reset();
  process.env.ETENGINE_INTERNAL_URL = ENGINE;

  global.fetch = jest.fn().mockResolvedValue({
    status: 200,
    text: async () => JSON.stringify({ gqueries: { co2: 50 } }),
  }) as any;
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe('a chart read', () => {
  it('asks the engine the first time and reports the miss', async () => {
    const res = makeRes();

    await handler(readReq('3', ['co2']), res);

    expect(calls()).toHaveLength(1);
    expect(calls()[0][0]).toBe(`${ENGINE}/api/v3/scenarios/3`);
    expect(headerFor(res)).toBe('miss');
  });

  it('answers the second time without asking the engine again', async () => {
    await handler(readReq('3', ['co2']), makeRes());
    const res = makeRes();
    await handler(readReq('3', ['co2']), res);

    expect(calls()).toHaveLength(1);
    expect(headerFor(res)).toBe('hit');
    expect(res.json).toHaveBeenCalledWith({ gqueries: { co2: 50 } });
  });

  it('does not serve one bearer an entry another primed', async () => {
    await handler(readReq('3', ['co2'], SIGNED_IN), makeRes());
    await handler(readReq('3', ['co2'], SOMEBODY_ELSE), makeRes());

    expect(calls()).toHaveLength(2);
  });

  it('does not serve a signed-out caller an entry a signed-in one primed', async () => {
    await handler(readReq('3', ['co2'], SIGNED_IN), makeRes());

    const res = makeRes();
    await handler(readReq('3', ['co2']), res);

    expect(headerFor(res)).toBe('miss');
  });

  it('does share between two signed-out callers', async () => {
    await handler(readReq('3', ['co2']), makeRes());

    const res = makeRes();
    await handler(readReq('3', ['co2']), res);

    expect(calls()).toHaveLength(1);
    expect(headerFor(res)).toBe('hit');
  });

  it('does not confuse two sessions', async () => {
    await handler(readReq('3', ['co2']), makeRes());
    await handler(readReq('4', ['co2']), makeRes());

    expect(calls()).toHaveLength(2);
  });

  it('does not confuse two query lists', async () => {
    await handler(readReq('3', ['co2']), makeRes());
    await handler(readReq('3', ['co2', 'costs']), makeRes());

    expect(calls()).toHaveLength(2);
  });

  it('keeps nothing when the engine refused', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 422,
      text: async () => JSON.stringify({ errors: ['nope'] }),
    }) as any;

    await handler(readReq('3', ['co2']), makeRes());
    await handler(readReq('3', ['co2']), makeRes());

    expect(calls()).toHaveLength(2);
  });
});

describe('two callers arriving on a cold entry', () => {
  const deferred = () => {
    let resolve!: (value: unknown) => void;
    const promise = new Promise((res) => {
      resolve = res;
    });

    return { promise, resolve };
  };

  it('makes one engine call, not two', async () => {
    const gate = deferred();
    global.fetch = jest.fn().mockReturnValue(gate.promise) as any;

    const first = handler(readReq('3', ['co2']), makeRes());
    const second = handler(readReq('3', ['co2']), makeRes());

    gate.resolve({ status: 200, text: async () => JSON.stringify({ gqueries: { co2: 50 } }) });
    await Promise.all([first, second]);

    expect(calls()).toHaveLength(1);
  });

  it('answers both of them', async () => {
    const gate = deferred();
    global.fetch = jest.fn().mockReturnValue(gate.promise) as any;

    const firstRes = makeRes();
    const secondRes = makeRes();
    const both = Promise.all([
      handler(readReq('3', ['co2']), firstRes),
      handler(readReq('3', ['co2']), secondRes),
    ]);

    gate.resolve({ status: 200, text: async () => JSON.stringify({ gqueries: { co2: 50 } }) });
    await both;

    expect(firstRes.json).toHaveBeenCalledWith({ gqueries: { co2: 50 } });
    expect(secondRes.json).toHaveBeenCalledWith({ gqueries: { co2: 50 } });
  });

  it('does not coalesce two bearers', async () => {
    const gate = deferred();
    global.fetch = jest.fn().mockReturnValue(gate.promise) as any;

    const both = Promise.all([
      handler(readReq('3', ['co2'], SIGNED_IN), makeRes()),
      handler(readReq('3', ['co2'], SOMEBODY_ELSE), makeRes()),
    ]);

    gate.resolve({ status: 200, text: async () => JSON.stringify({ gqueries: { co2: 50 } }) });
    await both;

    expect(calls()).toHaveLength(2);
  });

  it('does not coalesce two different sessions', async () => {
    const gate = deferred();
    global.fetch = jest.fn().mockReturnValue(gate.promise) as any;

    const both = Promise.all([
      handler(readReq('3', ['co2']), makeRes()),
      handler(readReq('4', ['co2']), makeRes()),
    ]);

    gate.resolve({ status: 200, text: async () => JSON.stringify({ gqueries: { co2: 50 } }) });
    await both;

    expect(calls()).toHaveLength(2);
  });

  it('leaves the key usable after a failed call', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('engine unreachable')) as any;

    await expect(handler(readReq('3', ['co2']), makeRes())).rejects.toThrow('engine unreachable');

    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      text: async () => JSON.stringify({ gqueries: { co2: 50 } }),
    }) as any;

    await handler(readReq('3', ['co2']), makeRes());

    expect(calls()).toHaveLength(1);
  });
});

describe('a write', () => {
  it('always reaches the engine, never the cache', async () => {
    await handler(readReq('3', ['co2'], SIGNED_IN), makeRes());
    await handler(writeReq('3', ['co2']), makeRes());

    expect(calls()).toHaveLength(2);
    expect(calls()[1][1].body).toContain('user_values');
  });

  it('drops what it just made stale', async () => {
    await handler(readReq('3', ['co2'], SIGNED_IN), makeRes());
    await handler(writeReq('3', ['co2']), makeRes());
    await handler(readReq('3', ['co2'], SIGNED_IN), makeRes());

    expect(calls()).toHaveLength(3);
  });

  it('drops what another bearer had cached for the same session', async () => {
    await handler(readReq('3', ['co2'], SOMEBODY_ELSE), makeRes());
    await handler(writeReq('3', ['co2']), makeRes());

    const res = makeRes();
    await handler(readReq('3', ['co2'], SOMEBODY_ELSE), res);

    expect(headerFor(res)).toBe('miss');
  });

  it('that the engine refused leaves the entry alone, because nothing changed', async () => {
    await handler(readReq('3', ['co2'], SIGNED_IN), makeRes());

    global.fetch = jest.fn().mockResolvedValue({
      status: 422,
      text: async () => JSON.stringify({ errors: ['group does not balance'] }),
    }) as any;

    await handler(writeReq('3', ['co2']), makeRes());

    const res = makeRes();
    await handler(readReq('3', ['co2'], SIGNED_IN), res);

    expect(headerFor(res)).toBe('hit');
  });

  it('leaves another session cached', async () => {
    await handler(readReq('4', ['co2'], SIGNED_IN), makeRes());
    await handler(writeReq('3', ['co2']), makeRes());
    await handler(readReq('4', ['co2'], SIGNED_IN), makeRes());

    expect(calls()).toHaveLength(2);
  });
});

describe('a signed-out caller', () => {
  it('may still read', async () => {
    await handler(readReq('3', ['co2']), makeRes());

    expect(calls()).toHaveLength(1);
  });
});

describe('an id that is not a session ID', () => {
  it('cannot walk out of the scenarios path with the viewer\'s token', async () => {
    const req = {
      method: 'GET',
      cookies: SIGNED_IN,
      query: { id: '../../users' },
    } as unknown as NextApiRequest;

    await handler(req, makeRes());

    expect(calls()[0][0]).toBe(`${ENGINE}/api/v3/scenarios/..%2F..%2Fusers`);
  });
});

describe('a request that is not a chart read', () => {
  it('proxies a GET rather than caching it', async () => {
    const req = { method: 'GET', cookies: {}, query: { id: '3' } } as unknown as NextApiRequest;

    await handler(req, makeRes());
    await handler(req, makeRes());

    expect(calls()).toHaveLength(2);
  });

  it('proxies a PUT with no gqueries', async () => {
    const req = {
      method: 'PUT',
      cookies: {},
      query: { id: '3' },
      body: {},
    } as unknown as NextApiRequest;

    await handler(req, makeRes());
    await handler(req, makeRes());

    expect(calls()).toHaveLength(2);
  });
});
