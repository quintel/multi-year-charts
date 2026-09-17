import { cacheKey, invalidate, read, reset, stampFor, write } from '../scenarioCache';

const ANSWER = { status: 200, body: { gqueries: { co2: 50 } } };
const A = 'bearer-a';
const B = 'bearer-b';

const originalEnv = { ...process.env };

beforeEach(() => {
  reset();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
  process.env = { ...originalEnv };
});

describe('the key', () => {
  it('ignores the order the gqueries were asked for in', () => {
    expect(cacheKey(A, 3, ['b', 'a'])).toBe(cacheKey(A, 3, ['a', 'b']));
  });

  it('keeps two sessions apart', () => {
    expect(cacheKey(A, 3, ['a'])).not.toBe(cacheKey(A, 4, ['a']));
  });

  it('keeps two query lists apart', () => {
    expect(cacheKey(A, 3, ['a'])).not.toBe(cacheKey(A, 3, ['a', 'b']));
  });

  it('keeps two bearers apart', () => {
    expect(cacheKey(A, 3, ['a'])).not.toBe(cacheKey(B, 3, ['a']));
  });
});

describe('another bearer', () => {
  it('is not served an answer this one primed', () => {
    write(A, 3, ['co2'], ANSWER);

    expect(read(B, 3, ['co2'])).toBeUndefined();
  });

  it('does not have its own answer replaced by this one', () => {
    const other = { status: 200, body: { gqueries: { co2: 99 } } };

    write(A, 3, ['co2'], ANSWER);
    write(B, 3, ['co2'], other);

    expect(read(A, 3, ['co2'])).toEqual(ANSWER);
    expect(read(B, 3, ['co2'])).toEqual(other);
  });
});

describe('storing an answer', () => {
  it('serves it back for the same session and queries', () => {
    write(A, 3, ['co2'], ANSWER);

    expect(read(A, 3, ['co2'])).toEqual(ANSWER);
  });

  it('serves it back whatever order the queries arrive in', () => {
    write(A, 3, ['co2', 'costs'], ANSWER);

    expect(read(A, 3, ['costs', 'co2'])).toEqual(ANSWER);
  });

  it('does not answer for another session', () => {
    write(A, 3, ['co2'], ANSWER);

    expect(read(A, 4, ['co2'])).toBeUndefined();
  });

  it('does not answer for a different query list', () => {
    write(A, 3, ['co2'], ANSWER);

    expect(read(A, 3, ['co2', 'costs'])).toBeUndefined();
  });

  it('keeps nothing that is not a 200, because an error is cheap to ask for again', () => {
    write(A, 3, ['co2'], { status: 422, body: { errors: ['nope'] } });

    expect(read(A, 3, ['co2'])).toBeUndefined();
  });

  it('keeps nothing when the engine sent no body', () => {
    write(A, 3, ['co2'], { status: 200, body: undefined });

    expect(read(A, 3, ['co2'])).toBeUndefined();
  });
});

describe('the safety net TTL', () => {
  it('still answers just inside it', () => {
    write(A, 3, ['co2'], ANSWER);
    jest.advanceTimersByTime(299_000);

    expect(read(A, 3, ['co2'])).toEqual(ANSWER);
  });

  it('stops answering once it has passed, so a lost notice cannot stale a column forever', () => {
    write(A, 3, ['co2'], ANSWER);
    jest.advanceTimersByTime(300_001);

    expect(read(A, 3, ['co2'])).toBeUndefined();
  });
});

describe('invalidating a session', () => {
  it('drops every query list that session had', () => {
    write(A, 3, ['co2'], ANSWER);
    write(A, 3, ['costs'], ANSWER);

    expect(invalidate(3)).toBe(2);
    expect(read(A, 3, ['co2'])).toBeUndefined();
    expect(read(A, 3, ['costs'])).toBeUndefined();
  });

  it('leaves another session alone', () => {
    write(A, 3, ['co2'], ANSWER);
    write(A, 4, ['co2'], ANSWER);

    invalidate(3);

    expect(read(A, 4, ['co2'])).toEqual(ANSWER);
  });

  it('drops it for every bearer holding it', () => {
    write(A, 3, ['co2'], ANSWER);
    write(B, 3, ['co2'], ANSWER);

    expect(invalidate(3)).toBe(2);
    expect(read(A, 3, ['co2'])).toBeUndefined();
    expect(read(B, 3, ['co2'])).toBeUndefined();
  });

  it('reports nothing evicted when it held nothing', () => {
    expect(invalidate(3)).toBe(0);
  });
});

describe('the entry limit', () => {
  it('drops the oldest rather than growing without bound', () => {
    process.env.COLLECTIONS_SCENARIO_CACHE_MAX_ENTRIES = '2';

    write(A, 3, ['a'], ANSWER);
    write(A, 3, ['b'], ANSWER);
    write(A, 3, ['c'], ANSWER);

    expect(read(A, 3, ['a'])).toBeUndefined();
    expect(read(A, 3, ['b'])).toEqual(ANSWER);
    expect(read(A, 3, ['c'])).toEqual(ANSWER);
  });

  it('keeps the entry being read and drops the one nobody has asked for', () => {
    process.env.COLLECTIONS_SCENARIO_CACHE_MAX_ENTRIES = '2';

    write(A, 3, ['a'], ANSWER);
    write(A, 3, ['b'], ANSWER);

    expect(read(A, 3, ['a'])).toEqual(ANSWER);

    write(A, 3, ['c'], ANSWER);

    expect(read(A, 3, ['a'])).toEqual(ANSWER);
    expect(read(A, 3, ['b'])).toBeUndefined();
  });

  it('counts a rewritten entry as the newest, not the oldest', () => {
    process.env.COLLECTIONS_SCENARIO_CACHE_MAX_ENTRIES = '2';

    write(A, 3, ['a'], ANSWER);
    write(A, 3, ['b'], ANSWER);
    write(A, 3, ['a'], ANSWER);
    write(A, 3, ['c'], ANSWER);

    expect(read(A, 3, ['a'])).toEqual(ANSWER);
    expect(read(A, 3, ['b'])).toBeUndefined();
  });
});

describe('the remembered stamp limit', () => {
  const stampAt = (minute: number) => `2026-09-01T10:${String(minute).padStart(2, '0')}:00.000Z`;

  it('forgets the least recently told rather than growing without bound', () => {
    process.env.COLLECTIONS_SESSION_STAMP_MAX = '2';

    invalidate(1, stampAt(1));
    invalidate(2, stampAt(2));
    invalidate(3, stampAt(3));

    expect(stampFor(1)).toBeUndefined();
    expect(stampFor(2)).toBe(stampAt(2));
    expect(stampFor(3)).toBe(stampAt(3));
  });

  it('counts a session told again as the most recent', () => {
    process.env.COLLECTIONS_SESSION_STAMP_MAX = '2';

    invalidate(1, stampAt(1));
    invalidate(2, stampAt(2));
    invalidate(1, stampAt(3));
    invalidate(3, stampAt(4));

    expect(stampFor(1)).toBe(stampAt(3));
    expect(stampFor(2)).toBeUndefined();
  });

  it('remembers nothing for an unstamped notice', () => {
    invalidate(9);

    expect(stampFor(9)).toBeUndefined();
  });
});
