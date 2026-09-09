import type { NextApiRequest, NextApiResponse } from 'next';

import { invalidate } from '../../../../utils/cache/scenarioCache';

/**
 * Receives ETEngine's notice that a member session changed, and drops that session's data
 *
 * TODO: Consider access
 */
const stampFrom = (body: unknown): string | undefined => {
  if (!body || typeof body !== 'object') return undefined;

  const { stamp, updated_at: updatedAt } = body as Record<string, unknown>;
  const value = stamp ?? updatedAt;

  return typeof value === 'string' ? value : undefined;
};

const InvalidateSession = async function (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const sessionID = Number(req.query.id);

  if (!Number.isInteger(sessionID)) {
    return res.status(400).json({ errors: ['Expected a numeric session ID'] });
  }

  return res.status(200).json({ evicted: invalidate(sessionID, stampFrom(req.body)) });
};

export default InvalidateSession;
