/**
 * @jest-environment node
 */
import type { NextApiRequest, NextApiResponse } from 'next';

import handler from '../../../pages/api/sessions/stamps';
import { invalidate, recordScenarioChange, reset } from '../../../utils/cache/scenarioCache';
import { isNewer } from '../../../utils/api/middleware';

const STAMP = '2026-09-02T09:00:00.000000Z';

const makeRes = () => {
  const res: Partial<NextApiResponse> = {};
  res.status = jest.fn().mockReturnValue(res) as any;
  res.json = jest.fn().mockReturnValue(res) as any;
  return res as NextApiResponse;
};

const ask = (ids?: string, scenarios?: string) =>
  ({ query: { ids, scenarios } } as unknown as NextApiRequest);

beforeEach(reset);

describe('the stamps a tab polls', () => {
  it('reports only the sessions ETEngine has reported a change for', () => {
    invalidate(3, STAMP);

    const res = makeRes();
    handler(ask('3,4'), res);

    expect(res.json).toHaveBeenCalledWith({ stamps: { 3: STAMP }, scenarios: {} });
  });

  it('is happy with a missing or empty list', () => {
    const res = makeRes();
    handler(ask(), res);

    expect(res.json).toHaveBeenCalledWith({ stamps: {}, scenarios: {} });
  });

  it('reports the saved scenarios MyETM has reported a change for', () => {
    recordScenarioChange(42, STAMP);

    const res = makeRes();
    handler(ask('3001', '42,43'), res);

    expect(res.json).toHaveBeenCalledWith({ stamps: {}, scenarios: { 42: STAMP } });
  });
});

describe('deciding whether a stamp is worth acting on', () => {
  it('acts on a stamp later than the one the column holds', () => {
    expect(isNewer(STAMP, '2026-09-02T08:00:00.000000Z')).toBe(true);
  });

  it('ignores our own write, whose stamp the column already holds', () => {
    expect(isNewer(STAMP, STAMP)).toBe(false);
  });

  it('acts when either stamp is missing, so a gap never hides a change', () => {
    expect(isNewer(undefined, STAMP)).toBe(true);
    expect(isNewer(STAMP, undefined)).toBe(true);
  });
});
