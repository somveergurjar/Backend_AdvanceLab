import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import type { ServiceItem } from "@prisma/client";

export const servicesRouter = Router();

function itemResponse(i: ServiceItem) {
  return {
    id: i.Id,
    name: i.Name,
    description: i.Description,
    price: Number(i.Price),
    isActive: i.IsActive,
    discountPercent: i.DiscountPercent,
    offerBadgeText: i.OfferBadgeText,
  };
}

// Public: categories with their items, used by the site and the booking form's profile dropdown.
servicesRouter.get("/categories", async (_req, res) => {
  const categories = await prisma.serviceCategory.findMany({
    where: { IsActive: true },
    include: { Items: { where: { IsActive: true }, orderBy: { SortOrder: "asc" } } },
    orderBy: { SortOrder: "asc" },
  });

  res.json(
    categories.map((c) => ({
      id: c.Id,
      name: c.Name,
      slug: c.Slug,
      description: c.Description,
      sortOrder: c.SortOrder,
      items: c.Items.map(itemResponse),
    }))
  );
});

// Admin only: create/update a category.
servicesRouter.post("/categories", requireAuth, async (req, res) => {
  const { name, slug, description, sortOrder } = req.body ?? {};

  const category = await prisma.serviceCategory.create({
    data: { Name: name, Slug: slug, Description: description ?? null, SortOrder: sortOrder ?? 0, IsActive: true },
  });

  res.json({ id: category.Id, name: category.Name, slug: category.Slug, description: category.Description, sortOrder: category.SortOrder, items: [] });
});

servicesRouter.put("/categories/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.serviceCategory.findUnique({ where: { Id: id } });
  if (!existing) return res.status(404).end();

  const { name, slug, description, sortOrder } = req.body ?? {};
  await prisma.serviceCategory.update({
    where: { Id: id },
    data: { Name: name, Slug: slug, Description: description ?? null, SortOrder: sortOrder ?? 0 },
  });

  res.status(204).end();
});

servicesRouter.delete("/categories/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.serviceCategory.findUnique({ where: { Id: id } });
  if (!existing) return res.status(404).end();

  await prisma.serviceCategory.delete({ where: { Id: id } });
  res.status(204).end();
});

function validateDiscount(discountPercent: number | null | undefined) {
  return discountPercent == null || (discountPercent >= 0 && discountPercent <= 100);
}

// Admin only: create/update/delete individual test items within a category.
servicesRouter.post("/items", requireAuth, async (req, res) => {
  const { serviceCategoryId, name, description, price, sortOrder, isActive, discountPercent, offerBadgeText } = req.body ?? {};

  if (!validateDiscount(discountPercent)) {
    return res.status(400).json({ message: "Discount percent must be between 0 and 100." });
  }

  const item = await prisma.serviceItem.create({
    data: {
      ServiceCategoryId: serviceCategoryId,
      Name: name,
      Description: description ?? null,
      Price: price,
      SortOrder: sortOrder ?? 0,
      IsActive: isActive ?? true,
      DiscountPercent: discountPercent ?? null,
      OfferBadgeText: offerBadgeText ?? null,
    },
  });

  res.json(itemResponse(item));
});

servicesRouter.put("/items/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { serviceCategoryId, name, description, price, sortOrder, isActive, discountPercent, offerBadgeText } = req.body ?? {};

  if (!validateDiscount(discountPercent)) {
    return res.status(400).json({ message: "Discount percent must be between 0 and 100." });
  }

  const existing = await prisma.serviceItem.findUnique({ where: { Id: id } });
  if (!existing) return res.status(404).end();

  await prisma.serviceItem.update({
    where: { Id: id },
    data: {
      ServiceCategoryId: serviceCategoryId,
      Name: name,
      Description: description ?? null,
      Price: price,
      SortOrder: sortOrder ?? 0,
      IsActive: isActive ?? true,
      DiscountPercent: discountPercent ?? null,
      OfferBadgeText: offerBadgeText ?? null,
    },
  });

  res.status(204).end();
});

servicesRouter.delete("/items/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.serviceItem.findUnique({ where: { Id: id } });
  if (!existing) return res.status(404).end();

  await prisma.serviceItem.delete({ where: { Id: id } });
  res.status(204).end();
});
