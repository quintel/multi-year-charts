import { InputCollectionData, InputValue } from '../api/types';

const GROUP_TOTAL = 100;

const DISPLAY_THRESHOLD = 0.005;

// Leave disabled members out of the balance check
export const enabledMembers = (inputs: InputCollectionData, group: string): string[] =>
  Object.keys(inputs).filter((key) => inputs[key].share_group === group && !inputs[key].disabled);

// What a group sums to client side
export const groupTotal = (
  inputs: InputCollectionData,
  held: Record<string, InputValue>,
  group: string
): number =>
  enabledMembers(inputs, group).reduce(
    (sum, key) => sum + Number(held[key] ?? inputs[key].user ?? inputs[key].default),
    0
  );

export const unbalancedGroups = (
  inputs: InputCollectionData,
  held: Record<string, InputValue>
): Set<string> => {
  const touched = Object.keys(held)
    .map((key) => inputs[key]?.share_group)
    .filter((group): group is string => Boolean(group));

  return new Set(
    touched.filter(
      (group) => Math.abs(groupTotal(inputs, held, group) - GROUP_TOTAL) > DISPLAY_THRESHOLD
    )
  );
};
