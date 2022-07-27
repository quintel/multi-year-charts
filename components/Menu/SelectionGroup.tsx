import { createContext, useContext } from 'react';

import { CheckIcon } from '@heroicons/react/solid';
import Item, { BaseItem, ItemProps } from './Item';

/**
 * A selectable item must have a value and an onClick handler
 */
export type SelectableItemProps<T extends React.ElementType> = ItemProps<T> & {
  onClick: () => void;
  value: string;
};

const GroupContext = createContext<{ value: string | null; onChange: (value: string) => void }>({
  value: null,
  onChange: () => {},
});

export function ActiveItem<T extends React.ElementType>({
  children,
  ...rest
}: SelectableItemProps<T>) {
  return (
    <BaseItem
      {...rest}
      className="pointer-events-none text-emerald-600"
      activeClassName="pointer-events-none text-emerald-600"
      disabled
    >
      <CheckIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
      {children}
    </BaseItem>
  );
}

export function InactiveItem<T extends React.ElementType>({
  children,
  ...rest
}: SelectableItemProps<T>) {
  return (
    <Item {...rest}>
      <div className="mr-2 h-px w-4"></div> {children}
    </Item>
  );
}

export function SelectableItem<T extends React.ElementType>({
  children,
  value,
  ...rest
}: SelectableItemProps<T>) {
  const { value: groupValue, onChange } = useContext(GroupContext);

  if (value === groupValue) {
    return <ActiveItem {...rest}>{children}</ActiveItem>;
  }

  return (
    <InactiveItem {...rest} onClick={() => onChange(value)}>
      {children}
    </InactiveItem>
  );
}

export default function SelectionGroup({
  children,
  value,
  onChange,
}: {
  children: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <GroupContext.Provider value={{ value, onChange: onChange || (() => {}) }}>
      {children}
    </GroupContext.Provider>
  );
}
