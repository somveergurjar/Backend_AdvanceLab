import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import type { ContactMessage } from "@prisma/client";

export const contactMessagesRouter = Router();

function toResponse(m: ContactMessage) {
  return { id: m.Id, name: m.Name, email: m.Email, phone: m.Phone, message: m.Message, isRead: m.IsRead, createdAt: m.CreatedAt };
}

// Public: anyone can submit a message via the Contact Us form.
contactMessagesRouter.post("/", async (req, res) => {
  const { name, email, phone, message } = req.body ?? {};

  if (!name?.trim() || !message?.trim()) {
    return res.status(400).json({ message: "Name and message are required." });
  }

  const entity = await prisma.contactMessage.create({
    data: { Name: name.trim(), Email: email?.trim() || null, Phone: phone?.trim() || null, Message: message.trim(), IsRead: false, CreatedAt: new Date() },
  });

  res.json(toResponse(entity));
});

// Admin only: inbox of submitted messages.
contactMessagesRouter.get("/", requireAuth, async (_req, res) => {
  const messages = await prisma.contactMessage.findMany({ orderBy: { CreatedAt: "desc" } });
  res.json(messages.map(toResponse));
});

contactMessagesRouter.patch("/:id/read", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.contactMessage.findUnique({ where: { Id: id } });
  if (!existing) return res.status(404).end();

  await prisma.contactMessage.update({ where: { Id: id }, data: { IsRead: true } });
  res.status(204).end();
});

contactMessagesRouter.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.contactMessage.findUnique({ where: { Id: id } });
  if (!existing) return res.status(404).end();

  await prisma.contactMessage.delete({ where: { Id: id } });
  res.status(204).end();
});
