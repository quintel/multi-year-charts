import React, { useEffect, useState } from 'react';

import { useSession, signIn } from 'next-auth/react';

const TrySignIn = ({ children }: { children: React.ReactNode }) => {
  const { status } = useSession();
  const [renderChildren, setRenderChildren] = useState(status !== 'unauthenticated');

  useEffect(() => {
    async function trySignIn() {
      if (status === 'unauthenticated') {
        const lastAttempt = localStorage.getItem('last-login-attempt');
        const firstTry = localStorage.getItem('first-login-attempt');
        const tryPeriodOver = (firstTry && (parseInt(firstTry) < Date.now() - 300));

        if (!lastAttempt || (parseInt(lastAttempt) < Date.now() - 15 && !tryPeriodOver)) {
          localStorage.setItem('last-login-attempt', Date.now().toString());

          if (!firstTry) {
            localStorage.setItem('first-login-attempt', Date.now().toString());
          }

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
