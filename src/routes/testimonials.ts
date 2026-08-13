import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { getOrNotFound } from "../lib/getOrNotFound";
import { upsertTestimonialSchema } from "../lib/schemas";
import type { Testimonial } from "@prisma/client";

export const testimonialsRouter = Router();

function toResponse(t: Testimonial) {
  return {
    id: t.Id,
    customerName: t.CustomerName,
    roleOrLocation: t.RoleOrLocation,
    quote: t.Quote,
    rating: t.Rating,
    imageUrl: t.ImageUrl,
    sortOrder: t.SortOrder,
    isActive: t.IsActive,
  };
}

// Public: only active testimonials, for the homepage.
testimonialsRouter.get("/", async (_req, res) => {
  const testimonials = await prisma.testimonial.findMany({ where: { IsActive: true }, orderBy: { SortOrder: "asc" } });
  res.json(testimonials.map(toResponse));
});

// Admin only: every testimonial, active or not.
testimonialsRouter.get("/all", requireAuth, async (_req, res) => {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { SortOrder: "asc" } });
  res.json(testimonials.map(toResponse));
});

testimonialsRouter.post("/", requireAuth, validateBody(upsertTestimonialSchema), async (req, res) => {
  const { customerName, roleOrLocation, quote, rating, imageUrl, sortOrder, isActive } = req.body;

  const testimonial = await prisma.testimonial.create({
    data: {
      CustomerName: customerName,
      RoleOrLocation: roleOrLocation ?? null,
      Quote: quote,
      Rating: rating,
      ImageUrl: imageUrl ?? null,
      SortOrder: sortOrder,
      IsActive: isActive,
      CreatedAt: new Date(),
    },
  });

  res.json(toResponse(testimonial));
});

testimonialsRouter.put("/:id", requireAuth, validateBody(upsertTestimonialSchema), async (req, res) => {
  const id = Number(req.params.id);
  const existing = await getOrNotFound(res, () => prisma.testimonial.findUnique({ where: { Id: id } }));
  if (!existing) return;

  const { customerName, roleOrLocation, quote, rating, imageUrl, sortOrder, isActive } = req.body;
  await prisma.testimonial.update({
    where: { Id: id },
    data: {
      CustomerName: customerName,
      RoleOrLocation: roleOrLocation ?? null,
      Quote: quote,
      Rating: rating,
      ImageUrl: imageUrl ?? null,
      SortOrder: sortOrder,
      IsActive: isActive,
    },
  });

  res.status(204).end();
});

testimonialsRouter.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await getOrNotFound(res, () => prisma.testimonial.findUnique({ where: { Id: id } }));
  if (!existing) return;

  await prisma.testimonial.delete({ where: { Id: id } });
  res.status(204).end();
});
