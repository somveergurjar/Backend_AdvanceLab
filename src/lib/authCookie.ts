import type { Response } from "express";

export const AUTH_COOKIE_NAME = "adl_session";

// httpOnly so client-side JS (and therefore any XSS payload) cannot read the
// token at all. SameSite=lax still lets it travel on the frontend's
// cross-port localhost calls in dev (SameSite is scoped to the registrable
// domain, not the port) while blocking it from being attached to cross-site
// requests - the standard CSRF mitigation for cookie-based auth.
export function setAuthCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, { path: "/" });
}
