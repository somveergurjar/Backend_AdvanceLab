import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import type { CallbackRequest } from "@prisma/client";

export const callbackRequestsRouter = Router();

function toResponse(r: CallbackRequest) {
  return { id: r.Id, name: r.Name, phoneNo: r.PhoneNo, isContacted: r.IsContacted, createdAt: r.CreatedAt };
}

// Public: the home page's "Enter your number, we'll call you back" widget.
callbackRequestsRouter.post("/", async (req, res) => {
  const { name, phoneNo } = req.body ?? {};

  if (!phoneNo?.trim() || !/^\d{10}$/.test(phoneNo.trim())) {
    return res.status(400).json({ message: "Enter a valid 10-digit phone number." });
  }

  const callback = await prisma.callbackRequest.create({
    data: { Name: name?.trim() || null, PhoneNo: phoneNo.trim(), IsContacted: false, CreatedAt: new Date() },
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
  const existing = await prisma.callbackRequest.findUnique({ where: { Id: id } });
  if (!existing) return res.status(404).end();

  await prisma.callbackRequest.update({ where: { Id: id }, data: { IsContacted: true } });
  res.status(204).end();
});

callbackRequestsRouter.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.callbackRequest.findUnique({ where: { Id: id } });
  if (!existing) return res.status(404).end();

  await prisma.callbackRequest.delete({ where: { Id: id } });
  res.status(204).end();
});
