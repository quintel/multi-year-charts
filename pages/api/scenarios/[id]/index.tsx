import type { NextApiRequest, NextApiResponse } from 'next';

import proxyToEngine from '../../../../utils/api/engineProxy';

const ScenarioProxy = async function (req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  return proxyToEngine(req, res, `/api/v3/scenarios/${id}`);
};

export default ScenarioProxy;
