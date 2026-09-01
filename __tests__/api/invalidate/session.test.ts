/**
 * @jest-environment node
 */
import type { NextApiRequest, NextApiResponse } from 'next';

import handler from '../../../pages/api/invalidate/sessions/[id]';
import { read, reset, write } from '../../../utils/cache/scenarioCache';

const ANSWER = { status: 200, body: { gqueries: { co2: 50 } } };

const makeRes = () => {
  const res: Partial<NextApiResponse> = {};
  res.status = jest.fn().mockReturnValue(res) as any;
  res.json = jest.fn().mockReturnValue(res) as any;
  res.end = jest.fn().mockReturnValue(res) as any;
  res.setHeader = jest.fn().mockReturnValue(res) as any;
  return res as NextApiResponse;
};

const notice = (id: string, body: unknown = {}) =>
  ({ method: 'POST', query: { id }, body } as unknown as NextApiRequest);

beforeEach(reset);

describe('a notice that a session changed', () => {
  it('drops that session and reports how much went', async () => {
    write(3, ['co2'], ANSWER);
    write(3, ['costs'], ANSWER);

    const res = makeRes();
    await handler(notice('3'), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ evicted: 2 });
    expect(read(3, ['co2'])).toBeUndefined();
  });

  it('leaves another session alone', async () => {
    write(4, ['co2'], ANSWER);

    await handler(notice('3'), makeRes());

    expect(read(4, ['co2'])).toEqual(ANSWER);
  });

  it('acts on a stamped notice', async () => {
    write(3, ['co2'], ANSWER);

    await handler(notice('3', { stamp: '2026-09-01T10:00:00.000Z' }), makeRes());

    expect(read(3, ['co2'])).toBeUndefined();
  });

  it('takes the stamp from updated_at too, since the envelope is not settled', async () => {
    write(3, ['co2'], ANSWER);

    await handler(notice('3', { updated_at: '2026-09-01T10:00:00.000Z' }), makeRes());

    expect(read(3, ['co2'])).toBeUndefined();
  });

  it('ignores a redelivery', async () => {
    await handler(notice('3', { stamp: '2026-09-01T10:00:00.000Z' }), makeRes());
    write(3, ['co2'], ANSWER);

    const res = makeRes();
    await handler(notice('3', { stamp: '2026-09-01T10:00:00.000Z' }), res);

    expect(res.json).toHaveBeenCalledWith({ evicted: 0 });
    expect(read(3, ['co2'])).toEqual(ANSWER);
  });

  it('survives a body that is not an object', async () => {
    write(3, ['co2'], ANSWER);

    await handler(notice('3', 'nonsense'), makeRes());

    expect(read(3, ['co2'])).toBeUndefined();
  });
});

describe('a malformed notice', () => {
  it('refuses anything but a POST', async () => {
    const res = makeRes();
    const req = { method: 'GET', query: { id: '3' }, body: {} } as unknown as NextApiRequest;

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.setHeader).toHaveBeenCalledWith('Allow', 'POST');
  });

  it('refuses a session ID that is not a number', async () => {
    const res = makeRes();

    await handler(notice('nope'), res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
