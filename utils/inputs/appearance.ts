// grey --> dataset default, black --> editable, blue --> set
export const toneClass = (editable: boolean, isSet: boolean): string => {
  const weight = isSet ? 'filled-cell ' : '';

  if (!editable) return `${weight}text-myetm-400`;

  return `${weight}text-myetm-800`;
};

export interface CellFlags {
  selected: boolean;
  held: boolean;
  refused: boolean;
}

export const chromeClass = ({ selected, held, refused }: CellFlags): string => {
  if (refused) return 'border-red-500';
  if (held) return 'border-red-300 red-cell';

  return selected ? 'border-myetm-400' : 'border-transparent hover:border-myetm-400 hover:cursor-pointer';
};
