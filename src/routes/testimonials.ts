import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import type { Testimonial } from "@prisma/client";

export const testimonialsRouter = Router();

function toResponse(t: Testimonial) {
  return {
    id: t.Id,
    customerName: t.CustomerName,
    roleOrLocation: t.RoleOrLocation,
    quote: t.Quote,
    rating: t.Rating,
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

testimonialsRouter.post("/", requireAuth, async (req, res) => {
  const { customerName, roleOrLocation, quote, rating, sortOrder, isActive } = req.body ?? {};

  const testimonial = await prisma.testimonial.create({
    data: {
      CustomerName: customerName,
      RoleOrLocation: roleOrLocation ?? null,
      Quote: quote,
      Rating: rating ?? 5,
      SortOrder: sortOrder ?? 0,
      IsActive: isActive ?? true,
      CreatedAt: new Date(),
    },
  });

  res.json(toResponse(testimonial));
});

testimonialsRouter.put("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.testimonial.findUnique({ where: { Id: id } });
  if (!existing) return res.status(404).end();

  const { customerName, roleOrLocation, quote, rating, sortOrder, isActive } = req.body ?? {};
  await prisma.testimonial.update({
    where: { Id: id },
    data: {
      CustomerName: customerName,
      RoleOrLocation: roleOrLocation ?? null,
      Quote: quote,
      Rating: rating ?? 5,
      SortOrder: sortOrder ?? 0,
      IsActive: isActive ?? true,
    },
  });

  res.status(204).end();
});

testimonialsRouter.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.testimonial.findUnique({ where: { Id: id } });
  if (!existing) return res.status(404).end();

  await prisma.testimonial.delete({ where: { Id: id } });
  res.status(204).end();
});
