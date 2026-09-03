import type { NextApiRequest, NextApiResponse } from 'next';

import { SESSION_COOKIE_NAME } from '../../../utils/sessionCookie';

// Resolves a collection id into its title and scenario ids. The shared JWT session cookie is
// forwarded straight to MyETM as a bearer token, which verifies it locally. Empty when signed out,
// which MyETM rejects.
const CollectionProxy = async function (req: NextApiRequest, res: NextApiResponse) {
  const token = req.cookies[SESSION_COOKIE_NAME];

  // Encoded, so a crafted id cannot walk out of the collections path and reach another MyETM
  // endpoint with the viewer's token. Next types a route param as string | string[]; only the
  // first value is meaningful here.
  const id = encodeURIComponent([req.query.id].flat()[0] ?? '');

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_MYETM_URL}/api/v1/collections/${id}`,
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      method: 'GET',
    }
  );

  const json = await response.json();
  return res.status(response.status).json(json);
};

export default CollectionProxy;
