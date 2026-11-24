import { InputCollectionData, InputData, InputValue } from '../api/types';
import { toStep } from './coerce';

export const GROUP_TOTAL = 100;

export const DISPLAY_THRESHOLD = 0.005;

const countedByEngine = (input: InputData): boolean =>
  !input.disabled || input.coupling_disabled !== undefined;

export const enabledMembers = (inputs: InputCollectionData, group: string): string[] =>
  Object.keys(inputs).filter(
    (key) => inputs[key].share_group === group && countedByEngine(inputs[key])
  );

/**
 * Once a group is touched its untyped members are coerced to their step values so a group is balanced when sent
 */
export const memberValue = (
  input: InputData,
  typed: InputValue | undefined,
  touched: boolean
): InputValue => {
  if (typed !== undefined) return typed;

  const held = input.user ?? input.default;

  return touched && typeof held === 'number' ? toStep(held, input) : held;
};

export const groupTotal = (
  inputs: InputCollectionData,
  values: Record<string, InputValue>,
  group: string
): number => {
  const members = enabledMembers(inputs, group);
  const touched = members.some((key) => values[key] !== undefined);
  const sum = members.reduce(
    (total, key) => total + Number(memberValue(inputs[key], values[key], touched)),
    0
  );

  return Number(sum.toPrecision(12));
};

export const isBalanced = (total: number): boolean =>
  Math.abs(total - GROUP_TOTAL) <= DISPLAY_THRESHOLD;

const fixedValue = (
  values: Record<string, InputValue>,
  userValues: Record<string, InputValue>,
  key: string
): InputValue | undefined => values[key] ?? userValues[key];

// Whether the engine can absorb what the column is trying to send
export const absorbable = (
  inputs: InputCollectionData,
  values: Record<string, InputValue>,
  userValues: Record<string, InputValue>,
  group: string
): boolean => {
  const fixed = enabledMembers(inputs, group).map((key) => fixedValue(values, userValues, key));

  if (fixed.every((value) => value !== undefined)) return false;

  return fixed.reduce<number>((sum, value) => sum + Number(value ?? 0), 0) <= GROUP_TOTAL + DISPLAY_THRESHOLD;
};

//A group whose values the interface is keeping back, because the engine could only refuse them
export const isHeld = (
  inputs: InputCollectionData,
  values: Record<string, InputValue>,
  userValues: Record<string, InputValue>,
  group: string
): boolean => {
  if (!enabledMembers(inputs, group).some((key) => values[key] !== undefined)) return false;
  if (absorbable(inputs, values, userValues, group)) return false;

  return !isBalanced(groupTotal(inputs, values, group));
};

export const heldGroups = (
  inputs: InputCollectionData,
  values: Record<string, InputValue>,
  userValues: Record<string, InputValue>
): Set<string> => {
  const touched = Object.keys(values)
    .map((key) => inputs[key]?.share_group)
    .filter((group): group is string => Boolean(group));

  return new Set(
    Array.from(new Set(touched)).filter((group) => isHeld(inputs, values, userValues, group))
  );
};

// The engine's message when it refused a whole group
export const groupRefusal = (
  inputs: InputCollectionData,
  refused: Record<string, string>,
  group: string
): string | undefined => {
  const members = enabledMembers(inputs, group);
  const message = members.length > 0 ? refused[members[0]] : undefined;

  if (!message || !members.every((key) => refused[key] === message)) return undefined;

  return message;
};
