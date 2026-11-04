import type { NextRouter } from 'next/router';

import type { CurrentUser } from './useCurrentUser';
import type { CollectionMember } from './useResolvedCollection';

// Member lists already checked on this page loads
const checked = new Set<string>();

export const resetGrantBounce = () => checked.clear();

const lacksGrant = ({ scenarioID, access = 'read' }: CollectionMember, user: CurrentUser) =>
  access !== null && !user.access[access].includes(scenarioID);

const openSessionsUrl = (sessionIDs: number[]) => {
  const returnTo = new URL(window.location.href);
  returnTo.searchParams.set('granted', '1');

  const query = new URLSearchParams({
    session_ids: sessionIDs.join(','),
    return_to: returnTo.href,
  });
  return `${process.env.NEXT_PUBLIC_MYETM_URL}/saved_scenarios/open?${query}`;
};

// Where to send a signed-in viewer whose cookie lacks a grant on a member
export const grantBounceUrl = (
  members: CollectionMember[],
  user: CurrentUser | null,
  router: NextRouter
): string | null => {
  const key = members.map(({ scenarioID }) => scenarioID).join(',');

  if (!user || checked.has(key)) return null;
  checked.add(key);

  if (router.query.granted) {
    const { granted: _granted, ...query } = router.query;
    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
    return null;
  }

  const lacking = members.filter((member) => lacksGrant(member, user));
  return lacking.length ? openSessionsUrl(lacking.map(({ scenarioID }) => scenarioID)) : null;
};
