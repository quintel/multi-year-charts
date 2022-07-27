import { FC } from 'react';

import { TranslateIcon } from '@heroicons/react/outline';
import { ChevronDownIcon } from '@heroicons/react/solid';

import LocaleMessage from './LocaleMessage';
import Menu from './Menu';

import useCurrentLocale from '../utils/useCurrentLocale';

interface LocaleSwitcherProps {
  currentLocale: string;
  setLocale: (id: string) => void;
}

function Button() {
  return (
    <Menu.Button className="flex items-center rounded bg-transparent px-2 py-2 pr-1.5 text-gray-200 transition hover:bg-gray-600">
      <TranslateIcon className="-my-1 h-5 w-5" />
      <span className="sr-only">
        <LocaleMessage id="app.language" />
      </span>
      <ChevronDownIcon className="-my-1 h-5 w-5" />
    </Menu.Button>
  );
}

/**
 * Dropdown used in the MainNav to switch the UI from one locale to another.
 */
const LocaleSwitcher: FC<LocaleSwitcherProps> = (props) => {
  const locale = useCurrentLocale();

  return (
    <Menu button={<Button />}>
      <Menu.SelectionGroup
        value={locale}
        onChange={(value) => {
          props.setLocale(value);
        }}
      >
        <Menu.SelectableItem value="en">English</Menu.SelectableItem>
        <Menu.SelectableItem value="nl">Nederlands</Menu.SelectableItem>
      </Menu.SelectionGroup>
    </Menu>
  );
};

export default LocaleSwitcher;
