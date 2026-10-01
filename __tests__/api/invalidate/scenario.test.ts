/**
 * @jest-environment node
 */
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { SignJWT, exportJWK, generateKeyPair, createLocalJWKSet, type KeyLike } from 'jose';

const STAMP = '2026-09-02T09:01:00.000000Z';

let privateKey: KeyLike;
let handler: NextApiHandler;
let cache: typeof import('../../../utils/cache/scenarioCache');

const makeRes = () => {
  const res: Partial<NextApiResponse> = {};
  res.status = jest.fn().mockReturnValue(res) as any;
  res.json = jest.fn().mockReturnValue(res) as any;
  res.end = jest.fn().mockReturnValue(res) as any;
  return res as NextApiResponse;
};

const post = async (audience: string) => {
  const token = await new SignJWT({ saved_scenario_id: 42, stamp: STAMP })
    .setProtectedHeader({ alg: 'RS256', kid: 'test-key' })
    .setIssuer(process.env.NEXT_PUBLIC_MYETM_URL as string)
    .setAudience(audience)
    .setExpirationTime('5m')
    .sign(privateKey);

  return {
    method: 'POST',
    query: { id: '42' },
    headers: { authorization: `Bearer ${token}` },
  } as unknown as NextApiRequest;
};

// As in me.test.ts: a local JWKS stands in for MyETM's, so real signatures are verified offline
beforeAll(async () => {
  const pair = await generateKeyPair('RS256');
  privateKey = pair.privateKey;
  const jwk = { ...(await exportJWK(pair.publicKey)), kid: 'test-key', alg: 'RS256', use: 'sig' };

  jest.resetModules();
  jest.doMock('jose', () => ({
    ...jest.requireActual('jose'),
    createRemoteJWKSet: () => createLocalJWKSet({ keys: [jwk] }),
  }));

  handler = (await import('../../../pages/api/invalidate/scenarios/[id]')).default;
  cache = await import('../../../utils/cache/scenarioCache');
});

beforeEach(() => cache.reset());

it('records the stamp of a notice MyETM signed for Collections', async () => {
  await handler(await post('collections-events'), makeRes());

  expect(cache.scenarioStampFor(42)).toEqual(STAMP);
});

// An identity token carries MyETM's signature too, but was never meant for this route
it('refuses a token minted for another audience', async () => {
  const res = makeRes();

  await handler(await post(process.env.NEXT_PUBLIC_MYETM_URL as string), res);

  expect(res.status).toHaveBeenCalledWith(401);
  expect(cache.scenarioStampFor(42)).toBeUndefined();
});
