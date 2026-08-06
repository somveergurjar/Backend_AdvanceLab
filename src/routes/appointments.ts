import { Router } from "express";
import { prisma } from "../lib/prisma";
import { sendEmail } from "../services/emailService";
import { requireAuth } from "../middleware/auth";
import { AppointmentStatus } from "../lib/enums";
import type { Appointment, ServiceItem } from "@prisma/client";

export const appointmentsRouter = Router();

function toResponse(a: Appointment, serviceItemName: string | null) {
  return {
    id: a.Id,
    name: a.Name,
    address: a.Address,
    phoneNo: a.PhoneNo,
    email: a.Email,
    serviceItemId: a.ServiceItemId,
    serviceItemName,
    collectionDateTime: a.CollectionDateTime,
    description: a.Description,
    status: AppointmentStatus.toName(a.Status),
    rejectionReason: a.RejectionReason,
    createdAt: a.CreatedAt,
  };
}

// Public: anyone can book an appointment, no auth required.
appointmentsRouter.post("/", async (req, res) => {
  const { name, address, phoneNo, email, serviceItemId, collectionDateTime, description } = req.body ?? {};

  if (!name?.trim() || !address?.trim() || !phoneNo?.trim()) {
    return res.status(400).json({ message: "Name, address and phone number are required." });
  }

  const appointment = await prisma.appointment.create({
    data: {
      Name: name.trim(),
      Address: address.trim(),
      PhoneNo: phoneNo.trim(),
      Email: email?.trim() || null,
      ServiceItemId: serviceItemId ?? null,
      CollectionDateTime: new Date(collectionDateTime),
      Description: description?.trim() || null,
      Status: AppointmentStatus.toValue("Pending"),
      CreatedAt: new Date(),
    },
  });

  const adminEmail = process.env.NOTIFICATIONS_ADMIN_EMAIL;
  if (adminEmail) {
    await sendEmail(
      adminEmail,
      "New appointment booked",
      `${appointment.Name} booked a sample collection for ${appointment.CollectionDateTime.toString()}.\nPhone: ${appointment.PhoneNo}\nAddress: ${appointment.Address}`
    );
  }

  if (appointment.Email) {
    await sendEmail(
      appointment.Email,
      "Your appointment request — Advance Diagnostic Lab",
      `Hi ${appointment.Name},\n\nWe've received your request for sample collection on ${appointment.CollectionDateTime.toString()}. We'll contact you shortly to confirm.\n\n— Advance Diagnostic Lab`
    );
  }

  res.json(toResponse(appointment, null));
});

// Admin only: list all appointments.
appointmentsRouter.get("/", requireAuth, async (_req, res) => {
  const appointments = await prisma.appointment.findMany({
    include: { ServiceItem: true },
    orderBy: { CreatedAt: "desc" },
  });

  res.json(appointments.map((a: Appointment & { ServiceItem: ServiceItem | null }) => toResponse(a, a.ServiceItem?.Name ?? null)));
});

// Admin only: update status (Pending -> Confirmed -> Completed / Cancelled).
// Cancelled (i.e. "reject") requires a reason so the patient can be told why.
appointmentsRouter.patch("/:id/status", requireAuth, async (req, res) => {
  const { status, rejectionReason } = req.body ?? {};

  if (status === "Cancelled" && !rejectionReason?.trim()) {
    return res.status(400).json({ message: "A reason is required when rejecting an appointment." });
  }

  const id = Number(req.params.id);
  const existing = await prisma.appointment.findUnique({ where: { Id: id } });
  if (!existing) return res.status(404).end();

  const appointment = await prisma.appointment.update({
    where: { Id: id },
    data: {
      Status: AppointmentStatus.toValue(status),
      RejectionReason: status === "Cancelled" ? rejectionReason.trim() : null,
    },
  });

  if (appointment.Email && (status === "Confirmed" || status === "Cancelled")) {
    const subject =
      status === "Confirmed"
        ? "Your appointment is confirmed — Advance Diagnostic Lab"
        : "Your appointment could not be confirmed — Advance Diagnostic Lab";
    const body =
      status === "Confirmed"
        ? `Hi ${appointment.Name},\n\nYour sample collection on ${appointment.CollectionDateTime.toString()} is confirmed. Our team will arrive as scheduled.\n\n— Advance Diagnostic Lab`
        : `Hi ${appointment.Name},\n\nWe're unable to confirm your appointment request for ${appointment.CollectionDateTime.toString()}.\nReason: ${appointment.RejectionReason}\n\nPlease contact us or book a new time.\n\n— Advance Diagnostic Lab`;

    await sendEmail(appointment.Email, subject, body);
  }

  res.status(204).end();
});

// Admin only: delete an appointment record.
appointmentsRouter.delete("/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.appointment.findUnique({ where: { Id: id } });
  if (!existing) return res.status(404).end();

  await prisma.appointment.delete({ where: { Id: id } });
  res.status(204).end();
});
