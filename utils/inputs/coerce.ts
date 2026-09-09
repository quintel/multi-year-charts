export interface Bounds {
  min?: number;
  max?: number;
  step?: number;
}

const onStep = (value: number, step: number | undefined, round = Math.round): number =>
  step ? Number((round(value / step) * step).toPrecision(12)) : value;

// Rounds to the input's step, doesn't clamp
export const toStep = (value: number, { step }: Bounds): number => onStep(value, step);

const atLeast = (min: number, max: number | undefined, step?: number): number => {
  const inside = onStep(min, step, Math.ceil);

  return max !== undefined && inside > max ? min : inside;
};

const atMost = (max: number, min: number | undefined, step?: number): number => {
  const inside = onStep(max, step, Math.floor);

  return min !== undefined && inside < min ? max : inside;
};

/**
 * Brings a typed value into range: to the maximum if above it, to the minimum if below it, and to
 * the nearest step in between
 */
export const coerceValue = (value: number, { min, max, step }: Bounds): number => {
  const stepped = toStep(value, { step });

  if (min !== undefined && stepped < min) return atLeast(min, max, step);
  if (max !== undefined && stepped > max) return atMost(max, min, step);

  return stepped;
};
