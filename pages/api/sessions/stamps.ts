import type { NextApiRequest, NextApiResponse } from 'next';

import { stampFor } from '../../../utils/cache/scenarioCache';

const requested = (raw: string | string[] | undefined): number[] =>
  ((Array.isArray(raw) ? raw[0] : raw) ?? '')
    .split(',')
    .filter(Boolean)
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0);

// When ETEngine last said each session changed
const Stamps = (req: NextApiRequest, res: NextApiResponse) => {
  const stamps: Record<number, string> = {};

  requested(req.query.ids).forEach((id) => {
    const stamp = stampFor(id);

    if (stamp) stamps[id] = stamp;
  });

  return res.status(200).json(stamps);
};

export default Stamps;
