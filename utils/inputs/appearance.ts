// grey --> dataset default, black --> editable, blue --> set
export const toneClass = (editable: boolean, isSet: boolean): string => {
  const weight = isSet ? 'font-semibold ' : '';

  if (!editable) return `${weight}text-gray-400`;

  return `${weight}${isSet ? 'text-midnight-700' : 'text-gray-900'}`;
};

export interface CellFlags {
  selected: boolean;
  held: boolean;
  refused: boolean;
}

export const chromeClass = ({ selected, held, refused }: CellFlags): string => {
  if (refused) return 'border-red-500';
  if (held) return 'border-red-300';

  return selected ? 'border-gray-300' : 'border-transparent hover:border-gray-300 hover:cursor-pointer';
};
