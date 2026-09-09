import type { NextApiRequest, NextApiResponse } from 'next';

import { invalidate } from '../../../../utils/cache/scenarioCache';

/**
 * Receives ETEngine's notice that a member session changed, and drops that session's data
 */

const SKEW_MS = 60_000;

// Whether a stamp is one ETEngine could have written. A future stamp outranks every genuine notice
// that follows it, so the session would stay stale and every open tab would refetch on each poll
const isPlausible = (stamp: string): boolean => {
  const at = Date.parse(stamp);

  return !Number.isNaN(at) && at <= Date.now() + SKEW_MS;
};

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

  const stamp = stampFrom(req.body);

  if (stamp !== undefined && !isPlausible(stamp)) {
    return res.status(400).json({ errors: ['Expected a stamp no later than now'] });
  }

  return res.status(200).json({ evicted: invalidate(sessionID, stamp) });
};

export default InvalidateSession;
