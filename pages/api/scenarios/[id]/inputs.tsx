import { getToken } from 'next-auth/jwt';
import type { NextApiRequest, NextApiResponse } from 'next';

const InputsProxy = async function (req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req: req });
  const { id } = req.query;

  const response = await fetch(`${process.env.NEXT_PUBLIC_ETENGINE_URL}/api/v3/scenarios/${id}/inputs.json?defaults=original`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token["accessToken"]}` : '',
    },
    method: req.method,
  });

  const json = await response.json();

  return res.status(response.status).json(json);
};

export default InputsProxy;
