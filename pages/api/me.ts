import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyMyetmToken } from '../../utils/auth';
import { SESSION_COOKIE_NAME } from '../../utils/sessionCookie';

// Returns the signed-in user's public identity, read from the shared session cookie. This replaces
// NextAuth's useSession for the UI: the cookie is HttpOnly, so the browser cannot read it directly
// and asks this server-side endpoint instead. The cookie is a JWT minted by MyETM; verified here
// against its JWKS (cached and refreshed by jose's remote set) exactly like every other ETM app,
// rather than trusting the payload without checking the signature.
const Me = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = req.cookies[SESSION_COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ user: null });
  }

  const claims = await verifyMyetmToken(token);

  if (!claims?.sub) {
    return res.status(401).json({ user: null });
  }

  const user = claims.user as { name?: string; email?: string } | undefined;

  return res.status(200).json({
    user: { id: claims.sub, name: user?.name, email: user?.email },
  });
};

export default Me;
