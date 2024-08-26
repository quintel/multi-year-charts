import { getToken } from 'next-auth/jwt';
import type { NextApiRequest, NextApiResponse } from 'next';

const MycProxy = async function (req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req });
  const { id } = req.query;

  const response = await fetch(`${process.env.NEXT_PUBLIC_ETENGINE_URL}/api/v3/transition_paths/${id}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token.accessToken}` : '',
    },
    method: req.method,
  });
  // add scopes?

  const json = await response.json();

  return res.status(response.status).json(json);
};


export default MycProxy;
