import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { createToken } from "../services/tokenService";
import { sendEmail } from "../services/emailService";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { loginLimiter, forgotPasswordLimiter } from "../middleware/rateLimit";
import { setAuthCookie, clearAuthCookie } from "../lib/authCookie";
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
} from "../lib/schemas";

export const authRouter = Router();

authRouter.post("/login", loginLimiter, validateBody(loginSchema), async (req, res) => {
  const { username, password } = req.body;

  const user = await prisma.adminUser.findUnique({ where: { Username: username } });
  if (!user || !bcrypt.compareSync(password, user.PasswordHash)) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  await prisma.adminUser.update({ where: { Id: user.Id }, data: { LastLoginAt: new Date() } });

  const { token, expiresAt } = createToken(user);
  setAuthCookie(res, token, expiresAt);

  // The token itself never goes in the response body - it lives only in the
  // httpOnly cookie, unreadable to JS (and therefore to XSS). The frontend
  // only needs this display info to render the logged-in UI state.
  res.json({
    username: user.Username,
    role: user.Role,
    avatarUrl: user.AvatarUrl,
    expiresAt,
  });
});

authRouter.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  res.status(204).end();
});

// Always returns the same generic response whether or not the email matches an
// account, so this endpoint can't be used to discover which emails are registered.
authRouter.post("/forgot-password", forgotPasswordLimiter, validateBody(forgotPasswordSchema), async (req, res) => {
  const { email } = req.body;

  const user = await prisma.adminUser.findFirst({ where: { Email: email } });
  if (user) {
    const resetToken = crypto.randomBytes(32).toString("hex").toUpperCase();
    const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.adminUser.update({
      where: { Id: user.Id },
      data: { ResetToken: resetToken, ResetTokenExpiresAt: resetTokenExpiresAt },
    });

    const frontendUrl = process.env.FRONTEND_BASE_URL || "http://localhost:5173";
    const resetLink = `${frontendUrl}/admin/reset-password?token=${resetToken}`;

    await sendEmail(
      user.Email,
      "Reset your Advance Diagnostic Lab admin password",
      `Click the link below to reset your password. This link expires in 1 hour.\n\n${resetLink}\n\nIf you didn't request this, you can ignore this email.`
    );
  }

  res.json({ message: "If that email is registered, a reset link has been sent." });
});

authRouter.post("/reset-password", validateBody(resetPasswordSchema), async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await prisma.adminUser.findFirst({ where: { ResetToken: token } });
  if (!user || !user.ResetTokenExpiresAt || user.ResetTokenExpiresAt < new Date()) {
    return res.status(400).json({ message: "This reset link is invalid or has expired." });
  }

  await prisma.adminUser.update({
    where: { Id: user.Id },
    data: {
      PasswordHash: bcrypt.hashSync(newPassword, 10),
      ResetToken: null,
      ResetTokenExpiresAt: null,
    },
  });

  res.json({ message: "Password updated. You can now log in with your new password." });
});

// Authenticated: lets an already-logged-in admin change their own password,
// separate from the token-based reset flow used for a forgotten password.
authRouter.post("/change-password", requireAuth, validateBody(changePasswordSchema), async (req: AuthedRequest, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.adminUser.findUnique({ where: { Id: req.userId } });
  if (!user || !bcrypt.compareSync(currentPassword, user.PasswordHash)) {
    return res.status(400).json({ message: "Current password is incorrect." });
  }

  await prisma.adminUser.update({
    where: { Id: user.Id },
    data: { PasswordHash: bcrypt.hashSync(newPassword, 10) },
  });

  res.json({ message: "Password changed successfully." });
});

// Authenticated: the current admin's own profile (username/email), shown on the profile page.
authRouter.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.adminUser.findUnique({ where: { Id: req.userId } });
  if (!user) return res.status(404).end();

  res.json({ username: user.Username, email: user.Email, role: user.Role, avatarUrl: user.AvatarUrl });
});

authRouter.put("/profile", requireAuth, validateBody(updateProfileSchema), async (req: AuthedRequest, res) => {
  const { username, email, avatarUrl } = req.body;

  const user = await prisma.adminUser.findUnique({ where: { Id: req.userId } });
  if (!user) return res.status(404).end();

  const usernameTaken = await prisma.adminUser.findFirst({
    where: { Username: username, Id: { not: req.userId } },
  });
  if (usernameTaken) {
    return res.status(400).json({ message: "That username is already taken." });
  }

  const updated = await prisma.adminUser.update({
    where: { Id: user.Id },
    data: { Username: username.trim(), Email: email.trim(), AvatarUrl: avatarUrl ?? null },
  });

  res.json({ username: updated.Username, email: updated.Email, role: updated.Role, avatarUrl: updated.AvatarUrl });
});
