import type { Response } from "express";

// Every PATCH/PUT/DELETE route follows the same "load it, 404 if missing"
// shape before mutating - this collapses that repeated pair of lines into
// one call and gives the caller a typed, non-null result to work with.
export async function getOrNotFound<T>(
  res: Response,
  finder: () => Promise<T | null>
): Promise<T | undefined> {
  const record = await finder();
  if (!record) {
    res.status(404).end();
    return undefined;
  }
  return record;
}
