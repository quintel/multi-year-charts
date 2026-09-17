import { createHash } from 'crypto';
import type { NextApiRequest } from 'next';

import { SESSION_COOKIE_NAME } from '../sessionCookie';

// Every signed-out caller shares one bearer, because every one of them gets the same answer.
export const ANONYMOUS = 'anonymous';

/**
 * Who is asking, as far as the cache is concerned. The token itself is never held, only its hash,
 * and Collections doesn't verify it or read its claims
 */
export const bearerOf = (req: NextApiRequest): string => {
  const token = req.cookies[SESSION_COOKIE_NAME];

  return token ? createHash('sha256').update(token).digest('hex') : ANONYMOUS;
};
