import { InputCollectionData } from '../api/types';
import { enabledMembers } from './shareGroups';

export const RESET = 'reset';

// A share group member resets its whole group
export const resetKeys = (inputs: InputCollectionData, inputKey: string): string[] => {
  const group = inputs[inputKey]?.share_group;

  return group ? enabledMembers(inputs, group) : [inputKey];
};
