import NextAuth from 'next-auth';

/**
 * Takes a token, and returns a new token with updated `accessToken` and `accessTokenExpires`. If an
 * error occurs, returns the old token and an error property
 */
async function refreshAccessToken(token) {
  try {
    const url =
      `${process.env.NEXT_PUBLIC_ETENGINE_URL}/oauth/authorize?` +
      new URLSearchParams({
        client_id: process.env.AUTH_CLIENT_ID,
        client_secret: process.env.AUTH_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
      });

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: refreshedTokens.expires_at * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const authOptions = {
  providers: [
    {
      id: 'identity',
      name: 'Energy Transition Model',
      type: 'oauth',

      wellKnown: `${process.env.NEXT_PUBLIC_ETENGINE_URL}/.well-known/openid-configuration`,
      authorization: {
        params: { scope: 'openid profile email scenarios:read scenarios:write' },
      },

      idToken: true,
      checks: ['pkce', 'state'],
      clientId: process.env.AUTH_CLIENT_ID,
      clientSecret: process.env.AUTH_CLIENT_SECRET,
      issuer: process.env.NEXT_PUBLIC_ETENGINE_URL,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
        };
      },
    },
  ],
  callbacks: {
    jwt: ({ token, user, account }) => {
      if (account && user) {
        return {
          accessToken: account.access_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : null,
          refreshToken: account.refresh_token,
          user,
        };
      }

      // Return previous token if the access token has not expired yet
      if (!token.accessTokenExpires || Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    session({ session, token }) {
      const newSession = { ...session };

      newSession.user = token.user;
      newSession.accessToken = token.accessToken;
      newSession.error = token.error;

      return newSession;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) {
        // Allows relative callback URLs
        return Promise.resolve(`${baseUrl}${url}`);
      } else if (new URL(url).origin === baseUrl) {
        // Allows callback URLs on the same origin
        return Promise.resolve(url);
      } else if (new URL(url).origin === process.env.NEXT_PUBLIC_ETENGINE_URL) {
        // Allow redirects to ETEngine.
        return Promise.resolve(url);
      }

      return Promise.resolve(baseUrl);
    },
  },
};

const Auth = async (req, res) => {
  const isSilentAuthError =
    req.query.error === 'login_required' || req.query.error === 'consent_required';

  if (isSilentAuthError) {
    res.redirect(302, req.cookies['next-auth.callback-url'] ?? '/');
    return;
  }

  return NextAuth(authOptions)(req, res);
};

export default Auth;
