import type { NextPage } from 'next';

import charts from '../data/charts';
import { resolveVariantPath } from '../utils/charts';
import useLinkHelper from '../utils/useLinkHelper';

/**
 * Rendered when a user visits a collection without any chart specified.
 */
const CollectionIndex: NextPage = () => {
  const { useReplaceUrlWithCollection } = useLinkHelper();

  const [firstChart] = charts;
  const defaultVariantPath = resolveVariantPath(firstChart.variants, [])
    .map((node) => node.slug)
    .join('/');

  useReplaceUrlWithCollection(`/charts/${firstChart.slug}/${defaultVariantPath}`);

  return <></>;
};

export default CollectionIndex;
