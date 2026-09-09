import { coerceValue, toStep } from '../coerce';

describe('toStep', () => {
  it('rounds to the nearest step', () => {
    expect(toStep(33.333333, { step: 0.1 })).toBe(33.3);
    expect(toStep(33.36, { step: 0.1 })).toBe(33.4);
    expect(toStep(42.6, { step: 1 })).toBe(43);
  });

  it('leaves a value already on a step alone', () => {
    expect(toStep(33.3, { step: 0.1 })).toBe(33.3);
  });

  it('returns the value untouched when the input has no step', () => {
    expect(toStep(33.333333, {})).toBe(33.333333);
  });

  it('never clamps, because ETEngine holds share group members outside their range mid balance', () => {
    expect(toStep(105, { min: 0, max: 100, step: 0.1 })).toBe(105);
    expect(toStep(-5, { min: 0, max: 100, step: 0.1 })).toBe(-5);
  });

  it('does not leave floating point debris behind', () => {
    expect(toStep(0.3, { step: 0.1 })).toBe(0.3);
    expect(String(toStep(70.1, { step: 0.1 }))).toBe('70.1');
  });
});

describe('coerceValue', () => {
  it('rounds to the nearest step', () => {
    expect(coerceValue(33.333333, { min: 0, max: 100, step: 0.1 })).toBe(33.3);
  });

  it('clamps above the maximum and below the minimum', () => {
    expect(coerceValue(120, { min: 0, max: 100, step: 0.1 })).toBe(100);
    expect(coerceValue(-3, { min: 0, max: 100, step: 0.1 })).toBe(0);
  });

  it('honours a negative minimum', () => {
    expect(coerceValue(-40, { min: -20, max: 20, step: 1 })).toBe(-20);
    expect(coerceValue(-10.4, { min: -20, max: 20, step: 1 })).toBe(-10);
  });

  it('coerces a share group input, though the engine would allow the excess', () => {
    expect(coerceValue(105, { min: 0, max: 100, step: 0.1 })).toBe(100);
  });

  it('leaves a value alone when the input has no bounds', () => {
    expect(coerceValue(1234.5, {})).toBe(1234.5);
  });
});
