import { useEffect } from 'react';
import Router, { useRouter, type NextRouter } from 'next/router';

import useCurrentUser, { type CurrentUser } from './useCurrentUser';

// How a failed engine request reports a member the viewer may not read
const REFUSALS = ['403', '404'];

// Session ID lists already sent through MyETM on this page load
const bounced = new Set<string>();

export const resetGrantBounce = () => bounced.clear();

const sessionIDsFrom = (router: NextRouter): number[] => {
  const ids = String(router.query.scenarioIDs ?? '').split(',').map((id) => parseInt(id, 10));
  return ids.some(isNaN) ? [] : ids;
};

const openSessionsUrl = (sessionIDs: number[]) => {
  const returnTo = new URL(window.location.href);
  returnTo.searchParams.set('granted', '1');

  const query = new URLSearchParams({ return_to: returnTo.href });
  sessionIDs.forEach((id) => query.append('session_ids[]', String(id)));

  return `${process.env.NEXT_PUBLIC_MYETM_URL}/saved_scenarios/open?${query}`;
};

// Remembers a return from MyETM, so a refusal after it shows the error, then drops its marker
export const settleGrantBounce = (router: NextRouter) => {
  if (!router.query.granted) return;

  bounced.add(sessionIDsFrom(router).join(','));

  const { granted: _granted, ...query } = router.query;
  router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
};

// Where to send a signed-in viewer the engine refused, with the members their cookie holds no grant on
export const grantBounceUrl = (
  failureReason: string | null,
  user: CurrentUser | null,
  router: NextRouter
): string | null => {
  const sessionIDs = sessionIDsFrom(router);
  const key = sessionIDs.join(',');

  if (!user || !REFUSALS.includes(failureReason ?? '') || bounced.has(key)) return null;
  bounced.add(key);

  const lacking = sessionIDs.filter((id) => !user.access.read.includes(id));
  return lacking.length ? openSessionsUrl(lacking) : null;
};

// MyETM grants only the Sessions a viewer has a role on, so bounce on a refusal, not on a missing grant
export default function useGrantBounce(failureReason: string | null) {
  const router = useRouter();
  const { user } = useCurrentUser();

  useEffect(() => {
    if (router.isReady) settleGrantBounce(Router);
  }, [router.isReady, router.query.granted]);

  useEffect(() => {
    const bounce = grantBounceUrl(failureReason, user, Router);
    if (bounce) window.location.assign(bounce);
  }, [failureReason, user]);
}
