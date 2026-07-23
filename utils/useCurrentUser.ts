import { useEffect, useState } from 'react';

export interface CurrentUser {
  id: string;
  name?: string;
  email?: string;
}

// Replaces NextAuth's useSession. Fetches the signed-in user from /api/me, which reads the shared
// HttpOnly session cookie server-side (the browser cannot read it directly). Returns null when
// signed out.
export default function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch('/api/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { user, loading };
}
