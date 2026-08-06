import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import type { FeatureCard } from "@prisma/client";

export const featureCardsRouter = Router();

function toResponse(c: FeatureCard) {
  return { id: c.Id, pageSlug: c.PageSlug, iconKey: c.IconKey, title: c.Title, body: c.Body, sortOrder: c.SortOrder, isActive: c.IsActive };
}

// Public: only active cards for a given page, in order.
featureCardsRouter.get("/:pageSlug", async (req, res) => {
  const cards = await prisma.featureCard.findMany({
    where: { PageSlug: req.params.pageSlug, IsActive: true },
    orderBy: { SortOrder: "asc" },
  });
  res.json(cards.map(toResponse));
});

// Admin only: every card for a page, active or not.
featureCardsRouter.get("/:pageSlug/all", requireAuth, async (req, res) => {
  const cards = await prisma.featureCard.findMany({
    where: { PageSlug: req.params.pageSlug },
    orderBy: { SortOrder: "asc" },
  });
  res.json(cards.map(toResponse));
});

featureCardsRouter.post("/", requireAuth, async (req, res) => {
  const { pageSlug, iconKey, title, body, sortOrder, isActive } = req.body ?? {};

  const card = await prisma.featureCard.create({
    data: { PageSlug: pageSlug, IconKey: iconKey, Title: title, Body: body ?? null, SortOrder: sortOrder ?? 0, IsActive: isActive ?? true },
  });

  res.json(toResponse(card));
});

featureCardsRouter.put("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.featureCard.findUnique({ where: { Id: id } });
  if (!existing) return res.status(404).end();

  const { pageSlug, iconKey, title, body, sortOrder, isActive } = req.body ?? {};
  await prisma.featureCard.update({
    where: { Id: id },
    data: { PageSlug: pageSlug, IconKey: iconKey, Title: title, Body: body ?? null, SortOrder: sortOrder ?? 0, IsActive: isActive ?? true },
  });

  res.status(204).end();
});

featureCardsRouter.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.featureCard.findUnique({ where: { Id: id } });
  if (!existing) return res.status(404).end();

  await prisma.featureCard.delete({ where: { Id: id } });
  res.status(204).end();
});
