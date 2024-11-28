import type { NextPage } from 'next';

import ChartPage from './[...variantSlug]';

/**
 * Rendered when a user visits /.../charts/[chartSlug] - a chart without a variant. In this case we
 * render the standard chart page which works fine without a variant.
 */
const ChartPageWithoutVariant: NextPage = () => <ChartPage />;

export default ChartPageWithoutVariant;
