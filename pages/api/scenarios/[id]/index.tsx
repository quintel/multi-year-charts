import { getToken } from 'next-auth/jwt';
import type { NextApiRequest, NextApiResponse } from 'next';

const ScenarioProxy = async function (req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req: req });
  const { id } = req.query;

  const response = await fetch(`${process.env.NEXT_PUBLIC_ETENGINE_URL}/api/v3/scenarios/${id}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token["accessToken"]}` : '',
    },
    method: req.method,
    body: JSON.stringify(req.body),
  });

  const json = await response.json();

  return res.status(response.status).json(json);
};

export default ScenarioProxy;
