import jwt from "jsonwebtoken";
import type { AdminUser } from "@prisma/client";

const jwtKey = process.env.JWT_KEY!;
const issuer = process.env.JWT_ISSUER!;
const audience = process.env.JWT_AUDIENCE!;
const expiryHours = Number(process.env.JWT_EXPIRY_HOURS ?? "8");

export function createToken(user: AdminUser): { token: string; expiresAt: Date } {
  const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);

  const token = jwt.sign(
    {
      sub: user.Username,
      // "uid" instead of a standard claim: keeps a clean, unambiguous way to
      // read back the numeric user id (mirrors the .NET side's same choice).
      uid: String(user.Id),
      role: user.Role,
    },
    jwtKey,
    {
      issuer,
      audience,
      expiresIn: `${expiryHours}h`,
    }
  );

  return { token, expiresAt };
}

export interface TokenPayload {
  sub: string;
  uid: string;
  role: string;
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, jwtKey, { issuer, audience }) as TokenPayload;
}
