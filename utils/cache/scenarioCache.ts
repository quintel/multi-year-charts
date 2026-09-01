/**
 * Data for one engine session (everything ScenarioSerializer emits), cached in Next
 *
 * The cache is invalidated by etengine, and the TTL a safety net for if an invalidation never arrives
 * TODO: Handle access to this cache somehow
 */

export interface CachedResponse {
  status: number;
  body?: unknown;
}

interface Entry extends CachedResponse {
  sessionID: number;
  storedAt: number;
}

const store = new Map<string, Entry>();
const lastStamp = new Map<number, string>();

// TODO: Consider TTL and Max Entries based on
const ttlMs = () => Number(process.env.COLLECTIONS_SCENARIO_CACHE_TTL_MS || 300_000);
const maxEntries = () => Number(process.env.COLLECTIONS_SCENARIO_CACHE_MAX_ENTRIES || 500);

/** Gquery order is a caller's accident, so it must not decide whether two reads share an entry. */
export const cacheKey = (sessionID: number, gqueries: string[]) =>
  `${sessionID}:${[...gqueries].sort().join(',')}`;

const expired = (entry: Entry) => Date.now() - entry.storedAt > ttlMs();

export const read = (sessionID: number, gqueries: string[]): CachedResponse | undefined => {
  const key = cacheKey(sessionID, gqueries);
  const entry = store.get(key);

  if (!entry) return undefined;

  if (expired(entry)) {
    store.delete(key);
    return undefined;
  }

  return { status: entry.status, body: entry.body };
};

// Only a complete, successful answer is worth keeping
export const write = (sessionID: number, gqueries: string[], response: CachedResponse) => {
  if (response.status !== 200 || response.body === undefined) return;

  const key = cacheKey(sessionID, gqueries);

  // Re-setting an existing key keeps its insertion position
  store.delete(key);
  store.set(key, { ...response, sessionID, storedAt: Date.now() });

  evictOldest();
};

const evictOldest = () => {
  while (store.size > maxEntries()) {
    const oldest = store.keys().next().value;

    if (oldest === undefined) return;

    store.delete(oldest);
  }
};

// Whether a notice is worth acting on
const isNewer = (stamp: string, seen?: string) => {
  if (seen === undefined) return true;

  const arrived = Date.parse(stamp);
  const acted = Date.parse(seen);

  return Number.isNaN(arrived) || Number.isNaN(acted) || arrived > acted;
};

// Drops one session's data. Returns how many entries went
export const invalidate = (sessionID: number, stamp?: string): number => {
  if (stamp) {
    if (!isNewer(stamp, lastStamp.get(sessionID))) return 0;

    lastStamp.set(sessionID, stamp);
  }

  const invalidated = Array.from(store.entries())
    .filter(([, entry]) => entry.sessionID === sessionID)
    .map(([key]) => key);

  invalidated.forEach((key) => store.delete(key));

  return invalidated.length;
};

// Nothing currently invalidates the whole cache, used in tests
export const reset = () => {
  store.clear();
  lastStamp.clear();
};
