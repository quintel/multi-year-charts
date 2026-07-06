// MyETM owns the session cookie, so we simply redirect the browser to MyETM to sign in or out, and
// once the cookie is set every ETM app is authenticated. `return_to` brings the user back here.
const myetmUrl = () => process.env.NEXT_PUBLIC_MYETM_URL;

export function signIn(): void {
  const returnTo = encodeURIComponent(window.location.href);
  window.location.href = `${myetmUrl()}/identity/sign_in?return_to=${returnTo}`;
}

export function signOut(): void {
  window.location.href = `${myetmUrl()}/identity/sign_out`;
}
