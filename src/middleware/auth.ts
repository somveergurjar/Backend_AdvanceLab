import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../services/tokenService";
import { AUTH_COOKIE_NAME } from "../lib/authCookie";

export interface AuthedRequest extends Request {
  userId?: number;
  username?: string;
  role?: string;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = verifyToken(token);
    req.userId = Number(payload.uid);
    req.username = payload.sub;
    req.role = payload.role;
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
