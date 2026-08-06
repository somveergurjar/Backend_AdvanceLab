import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

// Validates req.body against a zod schema and replaces it with the parsed
// (trimmed/coerced) result, so route handlers can trust the shape instead of
// re-checking it with ad-hoc `if` statements.
export function validateBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "Invalid request.";
      return res.status(400).json({ message });
    }
    req.body = result.data;
    next();
  };
}
