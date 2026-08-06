import type { Response } from "express";

export const AUTH_COOKIE_NAME = "adl_session";

const isProduction = process.env.NODE_ENV === "production";

// httpOnly so client-side JS (and therefore any XSS payload) cannot read the
// token at all.
//
// SameSite=lax works in both dev and production because the frontend never
// talks to this API cross-site: in dev, localhost:5173 and localhost:5080
// are the same site (site is scoped to the registrable domain, not the
// port); in production, Vercel proxies /api and /uploads through to Render
// (see frontend/vercel.json), so from the browser's point of view every
// request stays on the same origin as the page itself. An earlier version of
// this used SameSite=None for a direct cross-origin setup, which several
// browsers' third-party-cookie blocking (Safari by default, and others)
// silently dropped - the cookie would be set on login but never sent back on
// the very next request, logging the user straight back out. Routing
// through the proxy instead of relaxing SameSite fixes that at the root.
export function setAuthCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    expires: expiresAt,
    path: "/",
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, { path: "/" });
}
