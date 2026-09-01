import { cacheKey, invalidate, read, reset, write } from '../scenarioCache';

const ANSWER = { status: 200, body: { gqueries: { co2: 50 } } };

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
    expect(cacheKey(3, ['b', 'a'])).toBe(cacheKey(3, ['a', 'b']));
  });

  it('keeps two sessions apart', () => {
    expect(cacheKey(3, ['a'])).not.toBe(cacheKey(4, ['a']));
  });

  it('keeps two query lists apart', () => {
    expect(cacheKey(3, ['a'])).not.toBe(cacheKey(3, ['a', 'b']));
  });
});

describe('storing an answer', () => {
  it('serves it back for the same session and queries', () => {
    write(3, ['co2'], ANSWER);

    expect(read(3, ['co2'])).toEqual(ANSWER);
  });

  it('serves it back whatever order the queries arrive in', () => {
    write(3, ['co2', 'costs'], ANSWER);

    expect(read(3, ['costs', 'co2'])).toEqual(ANSWER);
  });

  it('does not answer for another session', () => {
    write(3, ['co2'], ANSWER);

    expect(read(4, ['co2'])).toBeUndefined();
  });

  it('does not answer for a different query list', () => {
    write(3, ['co2'], ANSWER);

    expect(read(3, ['co2', 'costs'])).toBeUndefined();
  });

  it('keeps nothing that is not a 200, because an error is cheap to ask for again', () => {
    write(3, ['co2'], { status: 422, body: { errors: ['nope'] } });

    expect(read(3, ['co2'])).toBeUndefined();
  });

  it('keeps nothing when the engine sent no body', () => {
    write(3, ['co2'], { status: 200, body: undefined });

    expect(read(3, ['co2'])).toBeUndefined();
  });
});

describe('the safety net TTL', () => {
  it('still answers just inside it', () => {
    write(3, ['co2'], ANSWER);
    jest.advanceTimersByTime(299_000);

    expect(read(3, ['co2'])).toEqual(ANSWER);
  });

  it('stops answering once it has passed, so a lost notice cannot stale a column forever', () => {
    write(3, ['co2'], ANSWER);
    jest.advanceTimersByTime(300_001);

    expect(read(3, ['co2'])).toBeUndefined();
  });
});

describe('invalidating a session', () => {
  it('drops every query list that session had', () => {
    write(3, ['co2'], ANSWER);
    write(3, ['costs'], ANSWER);

    expect(invalidate(3)).toBe(2);
    expect(read(3, ['co2'])).toBeUndefined();
    expect(read(3, ['costs'])).toBeUndefined();
  });

  it('leaves another session alone', () => {
    write(3, ['co2'], ANSWER);
    write(4, ['co2'], ANSWER);

    invalidate(3);

    expect(read(4, ['co2'])).toEqual(ANSWER);
  });

  it('reports nothing evicted when it held nothing', () => {
    expect(invalidate(3)).toBe(0);
  });
});

describe('the entry limit', () => {
  it('drops the oldest rather than growing without bound', () => {
    process.env.COLLECTIONS_SCENARIO_CACHE_MAX_ENTRIES = '2';

    write(3, ['a'], ANSWER);
    write(3, ['b'], ANSWER);
    write(3, ['c'], ANSWER);

    expect(read(3, ['a'])).toBeUndefined();
    expect(read(3, ['b'])).toEqual(ANSWER);
    expect(read(3, ['c'])).toEqual(ANSWER);
  });

  it('counts a rewritten entry as the newest, not the oldest', () => {
    process.env.COLLECTIONS_SCENARIO_CACHE_MAX_ENTRIES = '2';

    write(3, ['a'], ANSWER);
    write(3, ['b'], ANSWER);
    write(3, ['a'], ANSWER);
    write(3, ['c'], ANSWER);

    expect(read(3, ['a'])).toEqual(ANSWER);
    expect(read(3, ['b'])).toBeUndefined();
  });
});
