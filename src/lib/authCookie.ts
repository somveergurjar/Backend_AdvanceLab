import type { Response } from "express";

export const AUTH_COOKIE_NAME = "adl_session";

const isProduction = process.env.NODE_ENV === "production";

// httpOnly so client-side JS (and therefore any XSS payload) cannot read the
// token at all.
//
// SameSite differs by environment because "site" is scoped to the
// registrable domain, not the port: in dev, localhost:5173 and
// localhost:5080 are the same site, so Lax still lets the cookie travel on
// cross-port calls while blocking cross-site requests (the usual CSRF
// mitigation). In production the frontend (Vercel) and backend (Render) are
// on genuinely different domains, so Lax would silently stop the cookie from
// ever being sent - that combination requires SameSite=None, which in turn
// requires Secure (HTTPS only, satisfied by both hosts). The CSRF exposure
// that opens is covered instead by requiring an exact-origin CORS allowlist
// plus a JSON content-type on every mutating request, which a cross-site
// form-based CSRF attempt cannot forge.
export function setAuthCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    expires: expiresAt,
    path: "/",
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, { path: "/" });
}
