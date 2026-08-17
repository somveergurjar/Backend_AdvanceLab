import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { getOrNotFound } from "../lib/getOrNotFound";
import { upsertFooterLinkSchema } from "../lib/schemas";
import type { FooterLink } from "@prisma/client";

export const footerLinksRouter = Router();

function toResponse(l: FooterLink) {
  return { id: l.Id, groupKey: l.GroupKey, label: l.Label, url: l.Url, sortOrder: l.SortOrder, isActive: l.IsActive };
}

// Public: active links only, used by the site footer.
footerLinksRouter.get("/", async (_req, res) => {
  const links = await prisma.footerLink.findMany({
    where: { IsActive: true },
    orderBy: [{ GroupKey: "asc" }, { SortOrder: "asc" }],
  });
  res.json(links.map(toResponse));
});

// Admin only: every link, active or not, for the Footer editor.
footerLinksRouter.get("/all", requireAuth, async (_req, res) => {
  const links = await prisma.footerLink.findMany({ orderBy: [{ GroupKey: "asc" }, { SortOrder: "asc" }] });
  res.json(links.map(toResponse));
});

footerLinksRouter.post("/", requireAuth, validateBody(upsertFooterLinkSchema), async (req, res) => {
  const { groupKey, label, url, sortOrder, isActive } = req.body;

  const link = await prisma.footerLink.create({
    data: { GroupKey: groupKey, Label: label, Url: url, SortOrder: sortOrder, IsActive: isActive },
  });

  res.json(toResponse(link));
});

footerLinksRouter.put("/:id", requireAuth, validateBody(upsertFooterLinkSchema), async (req, res) => {
  const id = Number(req.params.id);
  const existing = await getOrNotFound(res, () => prisma.footerLink.findUnique({ where: { Id: id } }));
  if (!existing) return;

  const { groupKey, label, url, sortOrder, isActive } = req.body;
  await prisma.footerLink.update({
    where: { Id: id },
    data: { GroupKey: groupKey, Label: label, Url: url, SortOrder: sortOrder, IsActive: isActive },
  });

  res.status(204).end();
});

footerLinksRouter.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await getOrNotFound(res, () => prisma.footerLink.findUnique({ where: { Id: id } }));
  if (!existing) return;

  await prisma.footerLink.delete({ where: { Id: id } });
  res.status(204).end();
});
