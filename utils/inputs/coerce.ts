export interface Bounds {
  min?: number;
  max?: number;
  step?: number;
}

const roundToStep = (value: number, step?: number): number =>
  step ? Number((Math.round(value / step) * step).toPrecision(12)) : value;

/**
 * Brings a typed value into range: to the maximum if above it, to the minimum if below it, and to
 * the nearest step in between.
 */
export const coerceValue = (value: number, { min, max, step }: Bounds): number => {
  const stepped = roundToStep(value, step);

  if (min !== undefined && stepped < min) return min;
  if (max !== undefined && stepped > max) return max;

  return stepped;
};
