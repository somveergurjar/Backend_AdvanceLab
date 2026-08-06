import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { publicFormLimiter } from "../middleware/rateLimit";
import { getOrNotFound } from "../lib/getOrNotFound";
import { createCallbackRequestSchema } from "../lib/schemas";
import type { CallbackRequest } from "@prisma/client";

export const callbackRequestsRouter = Router();

function toResponse(r: CallbackRequest) {
  return { id: r.Id, name: r.Name, phoneNo: r.PhoneNo, isContacted: r.IsContacted, createdAt: r.CreatedAt };
}

// Public: the home page's "Enter your number, we'll call you back" widget.
callbackRequestsRouter.post("/", publicFormLimiter, validateBody(createCallbackRequestSchema), async (req, res) => {
  const { name, phoneNo } = req.body;

  const callback = await prisma.callbackRequest.create({
    data: { Name: name || null, PhoneNo: phoneNo, IsContacted: false, CreatedAt: new Date() },
  });

  res.json(toResponse(callback));
});

// Admin only: inbox of callback requests.
callbackRequestsRouter.get("/", requireAuth, async (_req, res) => {
  const requests = await prisma.callbackRequest.findMany({ orderBy: { CreatedAt: "desc" } });
  res.json(requests.map(toResponse));
});

callbackRequestsRouter.patch("/:id/contacted", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await getOrNotFound(res, () => prisma.callbackRequest.findUnique({ where: { Id: id } }));
  if (!existing) return;

  await prisma.callbackRequest.update({ where: { Id: id }, data: { IsContacted: true } });
  res.status(204).end();
});

callbackRequestsRouter.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await getOrNotFound(res, () => prisma.callbackRequest.findUnique({ where: { Id: id } }));
  if (!existing) return;

  await prisma.callbackRequest.delete({ where: { Id: id } });
  res.status(204).end();
});
