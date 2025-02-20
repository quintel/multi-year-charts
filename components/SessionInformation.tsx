import { useSession, signIn, signOut } from 'next-auth/react';

import {
  ChevronDownIcon,
  IdentificationIcon,
  LogoutIcon,
  UserCircleIcon,
} from '@heroicons/react/solid';

import Menu from './Menu';
import LocaleMessage from '../components/LocaleMessage';

function Button({ children }: { children: React.ReactNode }) {
  return (
    <Menu.Button className="flex items-center rounded bg-transparent px-2 py-1 text-sm font-medium text-gray-300 transition hover:bg-gray-600 hover:text-gray-100">
      <UserCircleIcon className="mr-1 h-5 w-5" />
      {children}
      <ChevronDownIcon className="ml-0.5 -mr-1 h-5 w-5" />
    </Menu.Button>
  );
}

const SessionInformation = () => {
  const { data: session } = useSession();

  if (!session) {
    return (
      <button
        className="flex items-center rounded bg-transparent px-2 py-1 text-sm font-medium text-gray-300 transition hover:bg-gray-600 hover:text-gray-100"
        onClick={() => signIn('identity')}
      >
        <UserCircleIcon className="mr-1 h-5 w-5" />
        <LocaleMessage id="session.signIn" />
      </button>
    );
  }

  return (
    <Menu button={<Button>{session.user?.name}</Button>}>
      <Menu.Item
        as="a"
        target="_blank"
        href={`${process.env.NEXT_PUBLIC_MYETM_URL}/identity/profile`}
        className="group"
      >
        <IdentificationIcon className="mr-2 h-5 w-5 opacity-75 group-hover:opacity-100" />
        <LocaleMessage id="session.profile" />
      </Menu.Item>
      <Menu.Item
        onClick={() =>
          signOut({ callbackUrl: `${process.env.NEXT_PUBLIC_MYETM_URL}/identity/sign_out` })
        }
      >
        <LogoutIcon className="mr-2 h-5 w-5 opacity-75 group-hover:opacity-100" />
        <LocaleMessage id="session.signOut" />
      </Menu.Item>
    </Menu>
  );
};

export default SessionInformation;
