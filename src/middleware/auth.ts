import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../services/tokenService";

export interface AuthedRequest extends Request {
  userId?: number;
  username?: string;
  role?: string;
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = verifyToken(header.slice("Bearer ".length));
    req.userId = Number(payload.uid);
    req.username = payload.sub;
    req.role = payload.role;
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
