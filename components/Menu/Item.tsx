import { Menu as HeadlessMenu } from '@headlessui/react';

/**
 * An Item may have an "as" prop, which will cause it to be rendered as an element of the specified
 * type. Any props from the "as" type are permitted and will be passed through to the component.
 */
export type ItemProps<T extends React.ElementType = 'div'> = {
  as?: T;
  className?: string;
  activeClassName?: string;
  children: React.ReactNode;
  onClick?: () => void;
} & React.ComponentProps<T>;

export function BaseItem<T extends React.ElementType>({
  as,
  disabled,
  children,
  className,
  activeClassName,
  ...rest
}: ItemProps<T>) {
  const Comp = as && !disabled ? as : 'div';

  return (
    <HeadlessMenu.Item disabled={disabled}>
      {({ active }) => (
        <Comp
          className={`flex w-full cursor-pointer items-center whitespace-nowrap rounded py-1 pl-2 pr-8 outline-0 ${
            active ? activeClassName : className
          }`.trim()}
          {...rest}
        >
          {children}
        </Comp>
      )}
    </HeadlessMenu.Item>
  );
}

export default function Item<T extends React.ElementType>({
  children,
  className,
  ...rest
}: ItemProps<T>) {
  return (
    <BaseItem
      {...rest}
      className={`${className} text-gray-600`}
      activeClassName={`${className} bg-midnight-500 text-white`}
    >
      {children}
    </BaseItem>
  );
}
