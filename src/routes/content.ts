import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import type { ContentBlock, SiteImage } from "@prisma/client";

export const contentRouter = Router();

function blockResponse(b: ContentBlock) {
  return { id: b.Id, pageSlug: b.PageSlug, key: b.Key, title: b.Title, body: b.Body, imageUrl: b.ImageUrl, sortOrder: b.SortOrder };
}

function imageResponse(i: SiteImage) {
  return { id: i.Id, section: i.Section, url: i.Url, altText: i.AltText, sortOrder: i.SortOrder, isActive: i.IsActive };
}

// Public: fetch all editable text/image blocks for a given page (e.g. "home", "about-us").
contentRouter.get("/blocks/:pageSlug", async (req, res) => {
  const blocks = await prisma.contentBlock.findMany({
    where: { PageSlug: req.params.pageSlug },
    orderBy: { SortOrder: "asc" },
  });
  res.json(blocks.map(blockResponse));
});

// Admin only: list every content block across the whole site.
contentRouter.get("/blocks", requireAuth, async (_req, res) => {
  const blocks = await prisma.contentBlock.findMany({ orderBy: [{ PageSlug: "asc" }, { SortOrder: "asc" }] });
  res.json(blocks.map(blockResponse));
});

contentRouter.post("/blocks", requireAuth, async (req, res) => {
  const { pageSlug, key, title, body, imageUrl, sortOrder } = req.body ?? {};

  const existing = await prisma.contentBlock.findFirst({ where: { PageSlug: pageSlug, Key: key } });

  const data = { Title: title ?? null, Body: body ?? null, ImageUrl: imageUrl ?? null, SortOrder: sortOrder ?? 0, UpdatedAt: new Date() };

  const block = existing
    ? await prisma.contentBlock.update({ where: { Id: existing.Id }, data })
    : await prisma.contentBlock.create({ data: { PageSlug: pageSlug, Key: key, ...data } });

  res.json(blockResponse(block));
});

contentRouter.delete("/blocks/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.contentBlock.findUnique({ where: { Id: id } });
  if (!existing) return res.status(404).end();

  await prisma.contentBlock.delete({ where: { Id: id } });
  res.status(204).end();
});

// Public: images for a given site section (e.g. "home-slider").
contentRouter.get("/images/:section", async (req, res) => {
  const images = await prisma.siteImage.findMany({
    where: { Section: req.params.section, IsActive: true },
    orderBy: { SortOrder: "asc" },
  });
  res.json(images.map(imageResponse));
});

contentRouter.post("/images", requireAuth, async (req, res) => {
  const { section, url, altText, sortOrder, isActive } = req.body ?? {};

  const image = await prisma.siteImage.create({
    data: { Section: section, Url: url, AltText: altText ?? null, SortOrder: sortOrder ?? 0, IsActive: isActive ?? true },
  });

  res.json(imageResponse(image));
});

contentRouter.delete("/images/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.siteImage.findUnique({ where: { Id: id } });
  if (!existing) return res.status(404).end();

  await prisma.siteImage.delete({ where: { Id: id } });
  res.status(204).end();
});
