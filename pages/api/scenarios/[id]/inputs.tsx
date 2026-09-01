import type { NextApiRequest, NextApiResponse } from 'next';

import proxyToEngine from '../../../../utils/api/engineProxy';

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const upstreamQuery = (query: NextApiRequest['query']) => {
  const params = new URLSearchParams({ defaults: 'original' });
  const extras = first(query.include_extras);

  if (extras !== undefined) {
    params.set('include_extras', extras);
  }

  return params.toString();
};

const InputsProxy = async function (req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  return proxyToEngine(req, res, `/api/v3/scenarios/${id}/inputs.json?${upstreamQuery(req.query)}`);
};

export default InputsProxy;
