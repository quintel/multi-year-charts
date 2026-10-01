import type { NextApiRequest, NextApiResponse } from 'next';

import { scenarioStampFor, stampFor } from '../../../utils/cache/scenarioCache';

const requested = (raw: string | string[] | undefined): number[] =>
  ((Array.isArray(raw) ? raw[0] : raw) ?? '')
    .split(',')
    .filter(Boolean)
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0);

// Each known stamp, by ID. Unknown IDs are absent rather than null
const known = (ids: number[], lookup: (id: number) => string | undefined) =>
  Object.fromEntries(ids.flatMap((id) => (lookup(id) ? [[id, lookup(id)]] : [])));

// When ETEngine last said each session changed, and MyETM each saved scenario
const Stamps = (req: NextApiRequest, res: NextApiResponse) =>
  res.status(200).json({
    stamps: known(requested(req.query.ids), stampFor),
    scenarios: known(requested(req.query.scenarios), scenarioStampFor),
  });

export default Stamps;
