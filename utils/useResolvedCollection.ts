import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

/**
 * A collection ready to be rendered: a title and the scenarios it is made of.
 *
 * Both routes resolve to this. `/collections/[collectionID]` fetches it from MyETM;
 * `/[scenarioIDs]` — the legacy URL format, still in circulation — reads it from the URL itself.
 */
export interface ResolvedCollection {
  id: number | null;
  title: string | null;
  scenarioIDs: number[];
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
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!active) return;

        // MyETM pairs each scenario with the saved scenario it came from; only the ETEngine id
        // is needed to fetch the data.
        const scenarioIDs: number[] = Array.isArray(data?.scenarios)
          ? data.scenarios.map((member: { scenario_id: number }) => member.scenario_id)
          : [];

        if (!scenarioIDs.length) {
          setFetched(NOT_FOUND);
          return;
        }

        setFetched({
          status: 'ready',
          collection: { id: data.id, title: data.title ?? null, scenarioIDs },
        });
      })
      .catch(() => {
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

    return { status: 'ready', collection: { id: null, title: title ?? null, scenarioIDs: ids } };
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
