import { Fragment } from 'react';
import { Menu as HeadlessMenu, Transition } from '@headlessui/react';

import Divider from './Divider';
import Item from './Item';
import SectionHeader from './SectionHeader';
import SelectionGroup, { SelectableItem } from './SelectionGroup';

interface Props {
  button: React.ReactNode;
  buttonClassName?: string;
  children: React.ReactNode;
}

export default function Menu({ button, children }: Props) {
  return (
    <HeadlessMenu as="div" className="relative inline-block text-left">
      {button}

      <Transition
        as={Fragment}
        enter="transition ease-out duration-125"
        enterFrom="transform opacity-0 scale-90"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-200"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <HeadlessMenu.Items className="absolute left-0 z-10 mt-2 origin-center rounded-md bg-white bg-opacity-[100%] text-sm font-medium text-gray-600 shadow-lg ring-1 ring-black ring-opacity-5 backdrop-blur-sm focus:outline-none">
          <div className="relative p-2">{children}</div>
        </HeadlessMenu.Items>
      </Transition>
    </HeadlessMenu>
  );
}

Menu.Button = HeadlessMenu.Button;
Menu.Divider = Divider;
Menu.Item = Item;
Menu.SectionHeader = SectionHeader;
Menu.SelectableItem = SelectableItem;
Menu.SelectionGroup = SelectionGroup;
