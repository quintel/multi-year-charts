import { useEffect } from 'react';
import { useRouter } from 'next/router';

function hasScenarios(router: ReturnType<typeof useRouter>) {
  return router.query.scenarioIDs != null;
}

function linkTo(router: ReturnType<typeof useRouter>, href: string) {
  if (href.startsWith('/')) {
    return `/${router.query.scenarioIDs}${href}`;
  }

  return `/${router.query.scenarioIDs}/${href}`;
}

export default function useLinkHelper() {
  const router = useRouter();

  return {
    hasScenarios: () => {
      return hasScenarios(router);
    },

    linkTo(href: string) {
      return linkTo(router, href);
    },

    useReplaceUrlWithScenarios(href: string) {
      const canRedirect = hasScenarios(router);

      useEffect(() => {
        if (hasScenarios(router)) {
          router.replace(linkTo(router, href));
        }
      }, [canRedirect, href]);
    },
  };
}
