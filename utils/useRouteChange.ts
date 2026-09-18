import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

// A navigation which resolves quickly should not flash a spinner
const SPINNER_DELAY_MS = 150;

export default function useRouteChange() {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const start = (url: string) => {
      clearTimeout(timer);
      setPending(url);
      timer = setTimeout(() => setSlow(true), SPINNER_DELAY_MS);
    };

    const settle = () => {
      clearTimeout(timer);
      setPending(null);
      setSlow(false);
    };

    router.events.on('routeChangeStart', start);
    router.events.on('routeChangeComplete', settle);
    router.events.on('routeChangeError', settle);

    return () => {
      clearTimeout(timer);
      router.events.off('routeChangeStart', start);
      router.events.off('routeChangeComplete', settle);
      router.events.off('routeChangeError', settle);
    };
  }, [router.events]);

  return { pending, slow };
}
