import React, { useEffect, useState } from 'react';

import { useSession, signIn } from 'next-auth/react';

const TrySignIn = ({ children }: { children: React.ReactNode }) => {
  const { status } = useSession();
  const [renderChildren, setRenderChildren] = useState(status !== 'unauthenticated');

  useEffect(() => {
    async function trySignIn() {
      if (status === 'unauthenticated') {
        const lastAttempt = localStorage.getItem('last-login-attempt');
        const stop = localStorage.getItem('stop-login-attempt');
        // Stop reattempting to log in for a while when silent log in failed
        const stopAttempting = (stop && (parseInt(stop) > Date.now() - 60 * 15 * 30))

        if (!stopAttempting && (!lastAttempt || parseInt(lastAttempt) < Date.now() - 15)) {
          localStorage.setItem('last-login-attempt', Date.now().toString());

          await signIn('identity', { redirect: false }, { prompt: 'none' }).then((res) => {
            if (res?.ok) {
              localStorage.removeItem('last-login-attempt');
            } else {
              localStorage.setItem('stop-login-attempt', Date.now().toString());
            }
          })
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
