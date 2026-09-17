import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function useRouteChange() {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    const start = (url: string) => setPending(url);
    const settle = () => setPending(null);

    router.events.on('routeChangeStart', start);
    router.events.on('routeChangeComplete', settle);
    router.events.on('routeChangeError', settle);

    return () => {
      router.events.off('routeChangeStart', start);
      router.events.off('routeChangeComplete', settle);
      router.events.off('routeChangeError', settle);
    };
  }, [router.events]);

  return pending;
}
