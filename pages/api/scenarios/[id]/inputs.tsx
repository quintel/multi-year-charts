import type { NextApiRequest, NextApiResponse } from 'next';

import { SESSION_COOKIE_NAME } from '../../../../utils/sessionCookie';

const InputsProxy = async function (req: NextApiRequest, res: NextApiResponse) {
  // The shared JWT session cookie is forwarded straight to ETEngine as a bearer token, which
  // verifies it locally. Empty when signed out, which ETEngine rejects with 401.
  const token = req.cookies[SESSION_COOKIE_NAME];
  const { id } = req.query;

  const response = await fetch(`${process.env.NEXT_PUBLIC_ETENGINE_URL}/api/v3/scenarios/${id}/inputs.json?defaults=original`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    method: req.method,
  });

  const json = await response.json();
  return res.status(response.status).json(json);
};

export default InputsProxy;
