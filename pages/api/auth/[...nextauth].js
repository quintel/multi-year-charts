import NextAuth from 'next-auth';

/**
 * Fetches the token for communicating with ETEngine from MyETM.
 */
async function fetchEngineToken(userId) {
  const url = `${process.env.NEXT_PUBLIC_MYETM_URL}/identity/access_tokens`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.ETENGINE_CLIENT_ID,
      user_id: userId,
    }),
  });
  if (!response.ok) {
    console.error(`Failed to fetch ETEngine token. Status: ${response.status}`); // Log failure status
    throw new Error('Failed to get ETEngine token');
  }
  return response.json();
}

/**
 * Takes a token, and returns a new token with updated `accessToken` and `accessTokenExpires`. If an
 * error occurs, returns the old token and an error property
 */
async function refreshEngineAccessToken(token) {
  try {
    const url = `${process.env.NEXT_PUBLIC_MYETM_URL}/identity/access_tokens`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.ETENGINE_CLIENT_ID,
        user_id: token.userId,
      }),
    });
    const refreshedTokens = await response.json();

    if (!response.ok || !refreshedTokens.access_token) {
      throw refreshedTokens;
    }

    return {
      ...token,
      etAccessToken: refreshedTokens.access_token,
      etAccessTokenExpires: Date.now() + ((refreshedTokens.expires_in || 3600) * 1000),
    };
  } catch (error) {
    console.error('Error refreshing ETEngine access token:', error);
    return {
      ...token,
      error: 'RefreshEngineAccessTokenError',
    };
  }
}

/**
 * Takes a token, and returns a new token with updated `accessToken` and `accessTokenExpires`. If an
 * error occurs, returns the old token and an error property
 */
async function refreshAccessToken(token) {
  try {
    const url = `${process.env.NEXT_PUBLIC_MYETM_URL}/identity/access_tokens`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.AUTH_CLIENT_ID,
        user_id: token.userId,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok || !refreshedTokens.access_token) {
      throw refreshedTokens;
    }

    return {
      ...token, // Keep the existing token data
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + (refreshedTokens.expires_in * 1000 || 3600 * 1000), // Default to 1 hour if expires_in is missing
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
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

      wellKnown: `${process.env.NEXT_PUBLIC_MYETM_URL}/.well-known/openid-configuration`,
      authorization: {
        params: { scope: 'openid profile email scenarios:read scenarios:write' },
      },

      idToken: true,
      checks: ['pkce', 'state'],
      clientId: process.env.AUTH_CLIENT_ID,
      clientSecret: process.env.AUTH_CLIENT_SECRET,
      issuer: process.env.NEXT_PUBLIC_MYETM_URL,
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
    jwt: async ({ token, user, account }) => {
      // On initial sign in
      if (account && user) {

        let newToken = {
          ...token,
          idAccessToken: account.access_token,
          idAccessTokenExpires: account.expires_at ? account.expires_at * 1000 : null,
          idRefreshToken: account.refresh_token,
          user,
          userId: user.id,
        };

        // Refresh ID token if expired
        if (newToken.idAccessTokenExpires && Date.now() > newToken.idAccessTokenExpires) {
          console.log('Refreshing ID token...');
          newToken = await refreshAccessToken(newToken);
        }

        // Fetch new ETEngine token
        try {
          const engineTokens = await fetchEngineToken(newToken.userId);
          newToken.etAccessToken = engineTokens.access_token;
          newToken.etAccessTokenExpires = Date.now() + ((engineTokens.expires_in || 3600) * 1000);
        } catch (error) {
          console.error('Error fetching ETEngine tokens:', error);
        }

        return newToken;
      }

      // Refresh ETEngine token if expired or about to expire
      if (!token.etAccessTokenExpires || Date.now() > token.etAccessTokenExpires - 60 * 1000) {
        token = await refreshEngineAccessToken(token);
      }

      return token;
    },
    session({ session, token }) {

      const newSession = { ...session };
      newSession.user = token.user;
      newSession.idAccessToken = token.idAccessToken;
      newSession.etAccessToken = token.etAccessToken;
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
      } else if (new URL(url).origin === process.env.NEXTAUTH_URL) {
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
    res.redirect(
      302,
      req.cookies['next-auth.callback-url'] ?? req.cookies['__Secure-next-auth.callback-url'] ?? '/'
    );
    return;
  }

  return NextAuth(authOptions)(req, res);
};

export default Auth;
