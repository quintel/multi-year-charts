import { useRouter } from 'next/router';

function withSlash(url: string) {
  if (url.slice(url.length - 1) === '/') {
    return url;
  }

  return `${url}/`;
}

export default function useIsActiveURL(href: string | undefined): boolean {
  const router = useRouter();

  return href ? withSlash(router.asPath).startsWith(withSlash(href)) : false;
}
