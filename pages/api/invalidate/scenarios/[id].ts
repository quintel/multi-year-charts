import type { NextApiRequest, NextApiResponse } from 'next';

import { verifyMyetmToken } from '../../../../utils/auth';
import { recordScenarioChange } from '../../../../utils/cache/scenarioCache';

/**
 * Receives MyETM's notice that a saved scenario changed
 */
const InvalidateScenario = async function (req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const token = req.headers.authorization?.replace(/^Bearer /, '') ?? '';
  const claims = await verifyMyetmToken(token, 'collections-events');
  const savedScenarioID = Number(req.query.id);

  if (claims?.saved_scenario_id !== savedScenarioID || typeof claims.stamp !== 'string') {
    return res.status(401).end();
  }

  return res.status(200).json({ recorded: recordScenarioChange(savedScenarioID, claims.stamp) });
};

export default InvalidateScenario;
