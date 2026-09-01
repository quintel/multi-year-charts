import type { NextApiRequest, NextApiResponse } from 'next';

import proxyToEngine, {
  EngineResponse,
  fetchFromEngine,
  respondWith,
} from '../../../../utils/api/engineProxy';
import * as cache from '../../../../utils/cache/scenarioCache';
import { SESSION_COOKIE_NAME } from '../../../../utils/sessionCookie';

// The queries a cacheable read is asking for, or undefined
const readQueries = (req: NextApiRequest): string[] | undefined => {
  const body = req.body;

  if (req.method !== 'PUT' || !body || typeof body !== 'object' || body.scenario) return undefined;

  return Array.isArray(body.gqueries) ? body.gqueries : undefined;
};

const fetchScenario = (req: NextApiRequest, sessionID: number) =>
  fetchFromEngine(req.cookies[SESSION_COOKIE_NAME], `/api/v3/scenarios/${sessionID}`, {
    method: req.method,
    body: req.body,
  });

// One engine call per key at a time
const inFlight = new Map<string, Promise<EngineResponse>>();

const fetchOnce = (req: NextApiRequest, sessionID: number, gqueries: string[]) => {
  const key = cache.cacheKey(sessionID, gqueries);
  const waiting = inFlight.get(key);

  if (waiting) return waiting;

  // Cleared however it settles, so a failed call does not poison the key.
  const pending = fetchScenario(req, sessionID).finally(() => inFlight.delete(key));

  inFlight.set(key, pending);

  return pending;
};

const serveRead = async (
  req: NextApiRequest,
  res: NextApiResponse,
  sessionID: number,
  gqueries: string[]
) => {
  const hit = cache.read(sessionID, gqueries);

  if (hit) {
    res.setHeader('X-Collections-Cache', 'hit');
    return respondWith(res, hit);
  }

  const answer = await fetchOnce(req, sessionID, gqueries);

  cache.write(sessionID, gqueries, answer);
  res.setHeader('X-Collections-Cache', 'miss');

  return respondWith(res, answer);
};

const ScenarioProxy = async function (req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const sessionID = Number(id);
  const gqueries = readQueries(req);

  if (!Number.isInteger(sessionID)) {
    return proxyToEngine(req, res, `/api/v3/scenarios/${id}`);
  }

  if (gqueries === undefined) {
    const answer = await fetchScenario(req, sessionID);

    // A refusal rolls the transaction back
    if (req.method === 'PUT' && answer.status >= 200 && answer.status < 300) {
      cache.invalidate(sessionID);
    }

    return respondWith(res, answer);
  }

  return serveRead(req, res, sessionID, gqueries);
};

export default ScenarioProxy;
