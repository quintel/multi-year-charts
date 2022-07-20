import React, { FC, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';

interface LocaleSwitcherProps {
  currentLocale: string;
  setLocale: (id: string) => void;
}

/**
 * Dropdown used in the MainNav to switch the UI from one locale to another.
 */
const LocaleSwitcher: FC<LocaleSwitcherProps> = (props) => {
  const setLocaleWithEvent = (name: string) => {
    return (event: React.MouseEvent) => {
      props.setLocale(name);
      event.preventDefault();
    };
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="flex items-center rounded bg-transparent px-2 py-2 pr-1.5 text-slate-200 transition hover:bg-slate-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="-my-1 h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M7 2a1 1 0 011 1v1h3a1 1 0 110 2H9.578a18.87 18.87 0 01-1.724 4.78c.29.354.596.696.914 1.026a1 1 0 11-1.44 1.389c-.188-.196-.373-.396-.554-.6a19.098 19.098 0 01-3.107 3.567 1 1 0 01-1.334-1.49 17.087 17.087 0 003.13-3.733 18.992 18.992 0 01-1.487-2.494 1 1 0 111.79-.89c.234.47.489.928.764 1.372.417-.934.752-1.913.997-2.927H3a1 1 0 110-2h3V3a1 1 0 011-1zm6 6a1 1 0 01.894.553l2.991 5.982a.869.869 0 01.02.037l.99 1.98a1 1 0 11-1.79.895L15.383 16h-4.764l-.724 1.447a1 1 0 11-1.788-.894l.99-1.98.019-.038 2.99-5.982A1 1 0 0113 8zm-1.382 6h2.764L13 11.236 11.618 14z"
            clipRule="evenodd"
          />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="-my-1 h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
        <span className="sr-only">Language</span>
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-125"
        enterFrom="transform opacity-0 scale-90"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-200"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute left-0 z-10 mt-2 w-44 origin-center divide-y divide-slate-100 rounded bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-2">
            <Menu.Item>
              {({ active }: { active: boolean }) => (
                <button
                  className={`${
                    active ? 'bg-slate-500 text-white' : 'text-slate-900'
                  } group flex w-full items-center px-3 py-1.5 text-sm`}
                  onClick={setLocaleWithEvent('en')}
                >
                  English
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }: { active: boolean }) => (
                <button
                  className={`${
                    active ? 'bg-slate-500 text-white' : 'text-slate-900'
                  } group flex w-full items-center px-3 py-1.5 text-sm`}
                  onClick={setLocaleWithEvent('nl')}
                >
                  Nederlands
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default LocaleSwitcher;
