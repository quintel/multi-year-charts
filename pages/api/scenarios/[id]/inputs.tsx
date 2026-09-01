import type { NextApiRequest, NextApiResponse } from 'next';

import proxyToEngine from '../../../../utils/api/engineProxy';

const InputsProxy = async function (req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  return proxyToEngine(req, res, `/api/v3/scenarios/${id}/inputs.json?defaults=original`);
};

export default InputsProxy;
