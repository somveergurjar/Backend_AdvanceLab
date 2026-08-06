import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { publicFormLimiter } from "../middleware/rateLimit";
import { getOrNotFound } from "../lib/getOrNotFound";
import { B2BBusinessType, B2BInquiryStatus } from "../lib/enums";
import { createB2BInquirySchema, updateB2BStatusSchema } from "../lib/schemas";
import type { B2BInquiry } from "@prisma/client";

export const b2bInquiriesRouter = Router();

function toResponse(i: B2BInquiry) {
  return {
    id: i.Id,
    organizationName: i.OrganizationName,
    contactPerson: i.ContactPerson,
    email: i.Email,
    phone: i.Phone,
    businessType: B2BBusinessType.toName(i.BusinessType),
    city: i.City,
    message: i.Message,
    status: B2BInquiryStatus.toName(i.Status),
    createdAt: i.CreatedAt,
  };
}

// Public: any hospital/clinic/corporate can submit a partnership inquiry.
b2bInquiriesRouter.post("/", publicFormLimiter, validateBody(createB2BInquirySchema), async (req, res) => {
  const { organizationName, contactPerson, email, phone, businessType, city, message } = req.body;

  const inquiry = await prisma.b2BInquiry.create({
    data: {
      OrganizationName: organizationName,
      ContactPerson: contactPerson,
      Email: email,
      Phone: phone,
      BusinessType: B2BBusinessType.toValue(businessType),
      City: city || null,
      Message: message || null,
      Status: B2BInquiryStatus.toValue("New"),
      CreatedAt: new Date(),
    },
  });

  res.json(toResponse(inquiry));
});

// Admin only: pipeline of partnership inquiries.
b2bInquiriesRouter.get("/", requireAuth, async (_req, res) => {
  const inquiries = await prisma.b2BInquiry.findMany({ orderBy: { CreatedAt: "desc" } });
  res.json(inquiries.map(toResponse));
});

b2bInquiriesRouter.patch("/:id/status", requireAuth, validateBody(updateB2BStatusSchema), async (req, res) => {
  const id = Number(req.params.id);
  const existing = await getOrNotFound(res, () => prisma.b2BInquiry.findUnique({ where: { Id: id } }));
  if (!existing) return;

  await prisma.b2BInquiry.update({
    where: { Id: id },
    data: { Status: B2BInquiryStatus.toValue(req.body.status) },
  });
  res.status(204).end();
});

b2bInquiriesRouter.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await getOrNotFound(res, () => prisma.b2BInquiry.findUnique({ where: { Id: id } }));
  if (!existing) return;

  await prisma.b2BInquiry.delete({ where: { Id: id } });
  res.status(204).end();
});
