/**
 * @jest-environment node
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { SignJWT, exportJWK, generateKeyPair, createLocalJWKSet, type KeyLike } from 'jose';

const KID = 'test-key';
const ISSUER = process.env.NEXT_PUBLIC_MYETM_URL as string;

let privateKey: KeyLike;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let handler: (req: NextApiRequest, res: NextApiResponse) => any;

const makeRes = () => {
  const res: Partial<NextApiResponse> = {};
  res.status = jest.fn().mockReturnValue(res) as any;
  res.json = jest.fn().mockReturnValue(res) as any;
  return res as NextApiResponse;
};

const jwtFor = async (payload: Record<string, unknown>) => {
  return new SignJWT({ iss: ISSUER, ...payload })
    .setProtectedHeader({ alg: 'RS256', kid: KID })
    .sign(privateKey);
};

const reqWith = (cookies: Record<string, string>) => ({ cookies } as unknown as NextApiRequest);

// jose's remote JWKS fetcher (createRemoteJWKSet) makes a real HTTP request under the hood, which
// can't be intercepted via a global.fetch mock in jose v4's Node runtime. Mocking createRemoteJWKSet
// itself to return a local JWKS built from a real, freshly-generated test key pair exercises real
// signature verification (jwtVerify) without a network dependency.
beforeAll(async () => {
  const { publicKey, privateKey: signingKey } = await generateKeyPair('RS256');
  privateKey = signingKey;
  const jwk = { ...(await exportJWK(publicKey)), kid: KID, alg: 'RS256', use: 'sig' };

  jest.resetModules();
  jest.doMock('jose', () => ({
    ...jest.requireActual('jose'),
    createRemoteJWKSet: () => createLocalJWKSet({ keys: [jwk] }),
  }));

  handler = (await import('../me')).default;
});

describe('/api/me', () => {
  it('returns the user decoded from a validly-signed session cookie', async () => {
    const token = await jwtFor({
      sub: '42',
      exp: Math.floor(Date.now() / 1000) + 3600,
      user: { name: 'Ada', email: 'a@b.c' },
    });
    const res = makeRes();

    await handler(reqWith({ etm_session: token }), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      user: { id: '42', name: 'Ada', email: 'a@b.c' },
    });
  });

  it('returns 401 when no session cookie is present', async () => {
    const res = makeRes();

    await handler(reqWith({}), res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 for an expired token', async () => {
    const token = await jwtFor({
      sub: '42',
      exp: Math.floor(Date.now() / 1000) - 10,
      user: {},
    });
    const res = makeRes();

    await handler(reqWith({ etm_session: token }), res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 for a token signed by an untrusted key', async () => {
    const { privateKey: otherKey } = await generateKeyPair('RS256');
    const token = await new SignJWT({
      iss: ISSUER,
      sub: '42',
      exp: Math.floor(Date.now() / 1000) + 3600,
      user: {},
    })
      .setProtectedHeader({ alg: 'RS256', kid: KID })
      .sign(otherKey);
    const res = makeRes();

    await handler(reqWith({ etm_session: token }), res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 for a token from the wrong issuer', async () => {
    const token = await new SignJWT({
      iss: 'https://evil.example',
      sub: '42',
      exp: Math.floor(Date.now() / 1000) + 3600,
      user: {},
    })
      .setProtectedHeader({ alg: 'RS256', kid: KID })
      .sign(privateKey);
    const res = makeRes();

    await handler(reqWith({ etm_session: token }), res);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});
