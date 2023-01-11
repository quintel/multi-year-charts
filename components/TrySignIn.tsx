import React, { useEffect, useState } from 'react';

import { useSession, signIn } from 'next-auth/react';

const TrySignIn = ({ children }: { children: React.ReactNode }) => {
  const { status } = useSession();
  const [renderChildren, setRenderChildren] = useState(status === 'authenticated');

  useEffect(() => {
    async function trySignIn() {
      if (status === 'unauthenticated') {
        const lastAttempt = localStorage.getItem('last-login-attempt');

        if (!lastAttempt || parseInt(lastAttempt) < Date.now() - 15 * 60 * 1000) {
          localStorage.setItem('last-login-attempt', Date.now().toString());
          await signIn('identity', { redirect: false }, { prompt: 'none' });
        } else {
          setRenderChildren(true);
        }
      }
    }

    trySignIn();
  }, [setRenderChildren, status]);

  return <>{renderChildren ? children : null}</>;
};

export default TrySignIn;
