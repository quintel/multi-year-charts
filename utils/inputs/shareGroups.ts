import { InputCollectionData, InputValue } from '../api/types';

// Every input sharing a share group
export const groupMembers = (inputs: InputCollectionData, key: string): string[] => {
  const group = inputs[key]?.share_group;

  if (!group) return [];

  return Object.keys(inputs).filter((member) => inputs[member].share_group === group);
};

// Will the engine still have a member free to move once `key` is written?
export const isOpenFor = (
  inputs: InputCollectionData,
  userValues: Record<string, InputValue>,
  key: string
): boolean =>
  groupMembers(inputs, key).some(
    (member) => member !== key && !inputs[member].disabled && userValues[member] === undefined
  );
