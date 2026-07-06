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
export default function useSessionKeeper(): void {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      const expiryMs = readExpiryMs();

      if (expiryMs) {
        sessionStorage.removeItem(RECOVERY_KEY);
        const delay = Math.max(expiryMs - Date.now() - 60_000, 0);
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

    schedule();
    return () => clearTimeout(timer);
  }, []);
}
