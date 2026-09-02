// grey --> dataset default, black --> editable, blue --> set
export const toneClass = (editable: boolean, isSet: boolean): string => {
  if (isSet) return 'text-midnight-700';

  return editable ? 'text-gray-900' : 'text-gray-400';
};

export const chromeClass = (selected: boolean): string =>
  selected ? 'border-gray-300' : 'border-transparent hover:border-gray-300';
