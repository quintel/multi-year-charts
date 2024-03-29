import type { NextApiRequest, NextApiResponse } from 'next';

const AreaProxy = async function (req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  const response = await fetch(`${process.env.NEXT_PUBLIC_ETMODEL_URL}/areas/${id}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  const json = await response.json();
  return res.status(response.status).json(json);
};

export default AreaProxy;
