import rateLimit from "express-rate-limit";

// Tight limit on login: this is the endpoint an attacker would brute-force
// against the stored bcrypt hash.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again in a few minutes." },
});

// Forgot-password sends an email per request - throttle harder to prevent
// email-bombing an account or using it to enumerate registered addresses.
export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many password reset requests. Please try again later." },
});

// Shared limiter for the public, unauthenticated intake forms (appointments,
// B2B inquiries, callback requests, contact messages) - generous enough for
// a real visitor, tight enough to stop scripted flooding.
export const publicFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});
