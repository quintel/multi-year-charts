import React, { useEffect } from 'react';

import { useSession, signIn } from 'next-auth/react';

const TrySignIn = ({ children }: { children: React.ReactNode }) => {
  const { status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      const lastAttempt = localStorage.getItem('last-login-attempt');

      if (!lastAttempt || parseInt(lastAttempt) < Date.now() - 15 * 60 * 1000) {
        localStorage.setItem('last-login-attempt', Date.now().toString());
        signIn('identity', { callbackUrl: '', redirect: false }, { prompt: 'none' });
      }
    }
  }, [status]);

  return <>{children}</>;
};

export default TrySignIn;
