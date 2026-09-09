import type { NextApiRequest, NextApiResponse } from 'next';

import { SESSION_COOKIE_NAME } from '../sessionCookie';

const METHODS_WITHOUT_BODY = ['GET', 'HEAD', 'DELETE'];

const engineURL = () => process.env.ETENGINE_INTERNAL_URL || process.env.NEXT_PUBLIC_ETENGINE_URL;

const headersFor = (token: string | undefined) => ({
  Accept: 'application/json',
  'Content-Type': 'application/json',
  Authorization: token ? `Bearer ${token}` : '',
});

export interface EngineRequest {
  method?: string;
  body?: unknown;
}

export interface EngineResponse {
  status: number;
  /** Undefined when the engine sent no body at all, like in DELETE */
  body?: unknown;
}

/**
 * Performs the hop to ETEngine and returns what it said. The shared session cookie goes straight
 * through as a bearer token for now
 */
export async function fetchFromEngine(
  token: string | undefined,
  path: string,
  init: EngineRequest = {}
): Promise<EngineResponse> {
  const method = init.method || 'GET';

  const response = await fetch(`${engineURL()}${path}`, {
    headers: headersFor(token),
    method,
    body: METHODS_WITHOUT_BODY.includes(method) ? undefined : JSON.stringify(init.body),
  });

  const text = await response.text();

  return { status: response.status, body: text ? JSON.parse(text) : undefined };
}

// Writes an engine answer to a Next response, keeping the empty-body case
export const respondWith = (res: NextApiResponse, { status, body }: EngineResponse) =>
  body === undefined ? res.status(status).end() : res.status(status).json(body);

// Forwards a request to ETEngine and returns its response directly
export default async function proxyToEngine(
  req: NextApiRequest,
  res: NextApiResponse,
  path: string
) {
  const answer = await fetchFromEngine(req.cookies[SESSION_COOKIE_NAME], path, {
    method: req.method,
    body: req.body,
  });

  return respondWith(res, answer);
}
