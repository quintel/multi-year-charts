import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import * as Sentry from '@sentry/nextjs';

/**
 * One scenario of a collection. The title is the saved scenario's or null
 */
export interface CollectionMember {
  scenarioID: number;
  title: string | null;
}

/**
 * A collection ready to be rendered: a title and the scenarios it is made of.
 *
 * Both routes resolve to this. `/collections/[collectionID]` fetches it from MyETM;
 * `/[scenarioIDs]` — the legacy URL format, still in circulation — reads it from the URL itself.
 */
export interface ResolvedCollection {
  id: number | null;
  title: string | null;
  members: CollectionMember[];
}

export type ResolveStatus = 'loading' | 'ready' | 'notFound';

export interface Resolution {
  status: ResolveStatus;
  collection: ResolvedCollection | null;
}

const LOADING: Resolution = { status: 'loading', collection: null };
const NOT_FOUND: Resolution = { status: 'notFound', collection: null };

/**
 * Extracts the list of scenario IDs from the legacy comma-separated URL segment.
 */
export const scenarioIDsFromQuery = (queryIDs: string): number[] => {
  const ids = queryIDs.split(',').map((id) => parseInt(id, 10));

  return ids.some(isNaN) ? [] : ids;
};

const firstQueryValue = (value: string | string[] | undefined) =>
  value == null ? undefined : [value].flat()[0];

export default function useResolvedCollection(): Resolution {
  const router = useRouter();

  const collectionID = firstQueryValue(router.query.collectionID);
  const scenarioIDs = firstQueryValue(router.query.scenarioIDs);
  const title = firstQueryValue(router.query.title);

  const [fetched, setFetched] = useState<Resolution>(LOADING);

  useEffect(() => {
    if (collectionID == null) {
      return;
    }

    let active = true;
    setFetched(LOADING);

    fetch(`/api/collections/${encodeURIComponent(collectionID)}`, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    })
      .then((response) => {
        if (response.ok) return response.json();

        if (response.status >= 500) {
          Sentry.captureException(
            new Error(`Collection ${collectionID} failed: ${response.status}`)
          );
        }

        return null;
      })
      .then((data) => {
        if (!active) return;

        // MyETM pairs each scenario with the saved scenario it is associated with
        const members: CollectionMember[] = Array.isArray(data?.scenarios)
          ? data.scenarios.map((member: { scenario_id: number; title: string | null }) => ({
              scenarioID: member.scenario_id,
              title: member.title ?? null,
            }))
          : [];

        if (!members.length) {
          setFetched(NOT_FOUND);
          return;
        }

        setFetched({
          status: 'ready',
          collection: { id: data.id, title: data.title ?? null, members },
        });
      })
      .catch((error) => {
        Sentry.captureException(error);

        if (active) setFetched(NOT_FOUND);
      });

    return () => {
      active = false;
    };
  }, [collectionID]);

  // Legacy route. The title is whatever the URL claims it is, which is why the new route does not
  // read it. Memoised because callers put the result into the store on change: a fresh object every
  // render would dispatch on every render, and the resulting state change would render again.
  const legacy = useMemo<Resolution | null>(() => {
    if (scenarioIDs == null) {
      return null;
    }

    const ids = scenarioIDsFromQuery(scenarioIDs);

    if (!ids.length) {
      return NOT_FOUND;
    }

    const members = ids.map((scenarioID) => ({ scenarioID, title: null }));

    return { status: 'ready', collection: { id: null, title: title ?? null, members } };
  }, [scenarioIDs, title]);

  if (collectionID != null) {
    return fetched;
  }

  if (legacy) {
    return legacy;
  }

  // Next populates route params on the first client render only, so neither being present yet is
  // not a failure.
  return router.isReady ? NOT_FOUND : LOADING;
}
