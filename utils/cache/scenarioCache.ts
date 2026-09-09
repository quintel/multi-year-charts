/**
 * Data for one engine session (everything ScenarioSerializer emits), cached in Next
 *
 * The cache is invalidated by etengine, and the TTL a safety net for if an invalidation never arrives
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
const maxStamps = () => Number(process.env.COLLECTIONS_SESSION_STAMP_MAX || 10_000);

// An entry belongs to the bearer that filled it

export const cacheKey = (bearer: string, sessionID: number, gqueries: string[]) =>
  `${bearer}:${sessionID}:${[...gqueries].sort().join(',')}`;

const expired = (entry: Entry) => Date.now() - entry.storedAt > ttlMs();

export const read = (
  bearer: string,
  sessionID: number,
  gqueries: string[]
): CachedResponse | undefined => {
  const key = cacheKey(bearer, sessionID, gqueries);
  const entry = store.get(key);

  if (!entry) return undefined;

  if (expired(entry)) {
    store.delete(key);
    return undefined;
  }

  // Re-inserting moves the key to the end, so eviction takes the least recently read rather than
  // the oldest written
  store.delete(key);
  store.set(key, entry);

  return { status: entry.status, body: entry.body };
};

// Only a complete, successful answer is worth keeping
export const write = (
  bearer: string,
  sessionID: number,
  gqueries: string[],
  response: CachedResponse
) => {
  if (response.status !== 200 || response.body === undefined) return;

  const key = cacheKey(bearer, sessionID, gqueries);

  // Re-setting an existing key keeps its insertion position
  store.delete(key);
  store.set(key, { ...response, sessionID, storedAt: Date.now() });

  evictOldest();
};

/**
 * ETEngine notices a write to any scenario, not only one in a collection, so this grows with the
 * whole model's write traffic and is bounded for that reason
 */
const evictOldestStamps = () => {
  while (lastStamp.size > maxStamps()) {
    const oldest = lastStamp.keys().next().value;

    if (oldest === undefined) return;

    lastStamp.delete(oldest);
  }
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

// When ETEngine last said this session changed
export const stampFor = (sessionID: number) => lastStamp.get(sessionID);

// Drops one session's data. Returns how many entries went
export const invalidate = (sessionID: number, stamp?: string): number => {
  if (stamp) {
    if (!isNewer(stamp, lastStamp.get(sessionID))) return 0;

    // Re-setting moves the key to the end, making the eviction below least-recent
    lastStamp.delete(sessionID);
    lastStamp.set(sessionID, stamp);
    evictOldestStamps();
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
