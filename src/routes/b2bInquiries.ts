import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { B2BBusinessType, B2BInquiryStatus } from "../lib/enums";
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
b2bInquiriesRouter.post("/", async (req, res) => {
  const { organizationName, contactPerson, email, phone, businessType, city, message } = req.body ?? {};

  if (!organizationName?.trim() || !contactPerson?.trim() || !email?.trim() || !phone?.trim()) {
    return res.status(400).json({ message: "Organization name, contact person, email and phone are required." });
  }

  const inquiry = await prisma.b2BInquiry.create({
    data: {
      OrganizationName: organizationName.trim(),
      ContactPerson: contactPerson.trim(),
      Email: email.trim(),
      Phone: phone.trim(),
      BusinessType: B2BBusinessType.toValue(businessType),
      City: city?.trim() || null,
      Message: message?.trim() || null,
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

b2bInquiriesRouter.patch("/:id/status", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.b2BInquiry.findUnique({ where: { Id: id } });
  if (!existing) return res.status(404).end();

  await prisma.b2BInquiry.update({
    where: { Id: id },
    data: { Status: B2BInquiryStatus.toValue(req.body?.status) },
  });
  res.status(204).end();
});

b2bInquiriesRouter.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.b2BInquiry.findUnique({ where: { Id: id } });
  if (!existing) return res.status(404).end();

  await prisma.b2BInquiry.delete({ where: { Id: id } });
  res.status(204).end();
});
