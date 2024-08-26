import { useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';

import charts from '../../../data/charts';
import useLinkHelper from '../../../utils/useLinkHelper';

/**
 * Rendered when a user visits /[mycID] without any chart specified.
 */
const CollectionIndex: NextPage = () => {
  const router = useRouter();
  const { useReplaceUrlWithScenarios } = useLinkHelper();

  useReplaceUrlWithScenarios(`/charts/${charts[0].slug}/${charts[0].variants[0].slug}`);

  return <></>;
};

export default CollectionIndex;
