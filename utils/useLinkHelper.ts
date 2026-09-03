import { useEffect } from 'react';
import { useRouter } from 'next/router';

type Router = ReturnType<typeof useRouter>;

/**
 * The URL prefix every in-app link hangs off: the collection route, or the legacy scenario-ids
 * route for links still in circulation. Null when the current URL names no collection.
 */
function basePath(router: Router) {
  if (router.query.collectionID != null) {
    return `/collections/${router.query.collectionID}`;
  }

  if (router.query.scenarioIDs != null) {
    return `/${router.query.scenarioIDs}`;
  }

  return null;
}

function linkTo(router: Router, href: string) {
  const base = basePath(router);
  const path = href.startsWith('/') ? href : `/${href}`;

  // The legacy URLs carry their title as a query param, so it has to survive navigation. The
  // collection route reads its title from the API instead, and ignores the param.
  const title =
    router.query.collectionID == null && typeof router.query.title === 'string'
      ? `?title=${encodeURIComponent(router.query.title)}`
      : '';

  return `${base ?? ''}${path}${title}`;
}

export default function useLinkHelper() {
  const router = useRouter();

  return {
    hasCollection: () => {
      return basePath(router) != null;
    },

    linkTo(href: string) {
      return linkTo(router, href);
    },

    useReplaceUrlWithCollection(href: string) {
      const canRedirect = basePath(router) != null;

      useEffect(() => {
        if (basePath(router) != null) {
          router.replace(linkTo(router, href));
        }
      }, [canRedirect, href]);
    },
  };
}
