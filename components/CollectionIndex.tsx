import type { NextPage } from 'next';

import charts from '../data/charts';
import useLinkHelper from '../utils/useLinkHelper';

/**
 * Rendered when a user visits a collection without any chart specified.
 */
const CollectionIndex: NextPage = () => {
  const { useReplaceUrlWithCollection } = useLinkHelper();

  useReplaceUrlWithCollection(`/charts/${charts[0].slug}/${charts[0].variants[0].slug}`);

  return <></>;
};

export default CollectionIndex;
