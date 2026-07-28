// Cookie names carry a per-deployment suffix, so deployments that share a cookie domain don't
// share a session: beta and production both sit under energytransitionmodel.com with no common
// parent below it. MyETM writes the names; every consumer must derive the same ones.
//
// NEXT_PUBLIC_ because both the browser bundle (the session keeper) and the API routes need it —
// which also means it is inlined at build time, so it must be set when Collections is built, not
// only in its runtime environment.
const SUFFIX = process.env.NEXT_PUBLIC_SSO_COOKIE_SUFFIX ?? '';

export const SESSION_COOKIE_NAME = `etm_session${SUFFIX}`;
export const SESSION_EXP_COOKIE_NAME = `etm_session_exp${SUFFIX}`;
