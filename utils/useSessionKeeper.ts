import { useEffect } from 'react';

const REFRESH_URL = `${process.env.NEXT_PUBLIC_MYETM_URL}/session/refresh`;
const RECOVERY_KEY = 'etm-session-recovery';

// Expiry (ms) of the shared session cookie, read from the non-HttpOnly etm_session_exp hint cookie.
const readExpiryMs = (): number | null => {
  const match = document.cookie.match(/(?:^|;\s*)etm_session_exp=([^;]+)/);
  if (!match) return null;
  const exp = parseInt(decodeURIComponent(match[1]), 10);
  return Number.isFinite(exp) ? exp * 1000 : null;
};

const refresh = (): Promise<boolean> =>
  fetch(REFRESH_URL, { method: 'POST', credentials: 'include' })
    .then((res) => res.ok)
    .catch(() => false);

// Keeps the shared session cookie alive in the browser. The cookie is HttpOnly, so we time off the
// etm_session_exp hint: schedule a refresh ~1 min before expiry; if it succeeds, reschedule. On load
// without a live access cookie, attempt a single recovery refresh (the access cookie may have expired
// while the 24h refresh cookie is still valid) — guarded so a genuinely signed-out user doesn't loop.
//
// Kept deliberately in step with identity/session_keeper.js in the identity gem, which does the same
// job for the Rails apps
export default function useSessionKeeper(): void {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      clearTimeout(timer);
      const expiryMs = readExpiryMs();

      if (expiryMs) {
        sessionStorage.removeItem(RECOVERY_KEY);

        // Refresh a minute before expiry, or halfway through the remaining life when the session is
        // shorter than that, so a deliberately tiny ACCESS_TTL doesn't mean refreshing on a zero
        // delay forever. Plus 0-10s of jitter, so tabs across the ETM apps don't all rotate the
        // refresh token on the same tick and revoke it out from under each other.
        const remaining = expiryMs - Date.now();
        const lead = Math.min(60_000, Math.max(remaining / 2, 0));
        const delay = Math.max(remaining - lead + Math.random() * 10_000, 0);

        timer = setTimeout(() => {
          refresh().then((ok) => ok && schedule());
        }, delay);
      } else if (!sessionStorage.getItem(RECOVERY_KEY)) {
        sessionStorage.setItem(RECOVERY_KEY, '1');
        refresh().then((ok) => {
          if (ok) {
            sessionStorage.removeItem(RECOVERY_KEY);
            window.location.reload();
          }
        });
      }
    };

    // A sleeping machine does not run timers, and a backgrounded tab may have its own frozen.
    // Re-deciding when the tab becomes visible is what makes a closed laptop lid recover on wake,
    // rather than waiting for a tick that is never coming.
    const onVisible = () => document.visibilityState === 'visible' && schedule();

    schedule();
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
}
