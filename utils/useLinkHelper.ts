import { useRouter } from 'next/router';

export default function useLinkHelper() {
  const router = useRouter();

  return {
    linkTo(href: string) {
      if (href.startsWith('/')) {
        return `/${router.query.scenarioIDs}${href}`;
      }

      return `/${router.query.scenarioIDs}/${href}`;
    },
  };
}
