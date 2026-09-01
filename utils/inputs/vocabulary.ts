import { InputData, InputValue } from '../api/types';

export type ControlType = 'boolean' | 'enum' | 'numeric';

export const controlTypeFor = (unit: string): ControlType => {
  if (unit === 'bool') return 'boolean';
  if (unit === 'enum') return 'enum';

  return 'numeric';
};

export const displayUnit = (unit: string): string =>
  controlTypeFor(unit) === 'numeric' ? unit : '';

const decimalsToShow = (value: number): number => {
  const [, fraction] = value.toString().split('.');

  return fraction ? Math.min(fraction.length, 2) : 0;
};

export const formatInputValue = (
  value: InputValue,
  unit: string,
  translate: (id: string) => string
): string => {
  if (controlTypeFor(unit) === 'boolean') {
    return value ? translate('misc.yes') : translate('misc.no');
  }

  return typeof value === 'number' ? value.toFixed(decimalsToShow(value)) : String(value);
};

export const currentValue = (input: InputData): InputValue =>
  input.user === undefined ? input.default : input.user;
