// grey --> dataset default, black --> editable, blue --> set
export const toneClass = (editable: boolean, isSet: boolean): string => {
  if (isSet) return 'text-midnight-700';

  return editable ? 'text-gray-900' : 'text-gray-400';
};

export interface CellFlags {
  selected: boolean;
  unbalanced: boolean;
  refused: boolean;
}

export const chromeClass = ({ selected, unbalanced, refused }: CellFlags): string => {
  if (refused) return 'border-red-500';
  if (unbalanced) return 'border-red-300';

  return selected ? 'border-gray-300' : 'border-transparent hover:border-gray-300';
};
