import { describe, expect, it, afterAll, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../index";
import { prisma } from "../lib/prisma";

let agent: ReturnType<typeof request.agent>;

beforeAll(async () => {
  agent = request.agent(app);
  await agent.post("/api/auth/login").send({ username: "admin", password: "admin123" });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/appointments (public)", () => {
  it("rejects a booking missing required fields", async () => {
    const res = await request(app).post("/api/appointments").send({ address: "Addr", phoneNo: "9111111111" });
    expect(res.status).toBe(400);
  });

  it("rejects an invalid collection date", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .send({ name: "Test", address: "Addr", phoneNo: "9111111111", collectionDateTime: "not-a-date" });
    expect(res.status).toBe(400);
  });

  it("creates a valid booking and reports it back with Pending status", async () => {
    const res = await request(app).post("/api/appointments").send({
      name: "Vitest Booking",
      address: "Addr",
      phoneNo: "9111111111",
      collectionDateTime: "2026-09-01T10:00:00",
    });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("Pending");

    await prisma.appointment.delete({ where: { Id: res.body.id } });
  });
});

describe("PATCH /api/appointments/:id/status (admin)", () => {
  it("requires a reason when rejecting an appointment", async () => {
    const created = await prisma.appointment.create({
      data: {
        Name: "Vitest Reject Target",
        Address: "Addr",
        PhoneNo: "9111111111",
        CollectionDateTime: new Date("2026-09-01T10:00:00"),
        Status: 0,
        CreatedAt: new Date(),
      },
    });

    const res = await agent.patch(`/api/appointments/${created.Id}/status`).send({ status: "Cancelled" });
    expect(res.status).toBe(400);

    const withReason = await agent
      .patch(`/api/appointments/${created.Id}/status`)
      .send({ status: "Cancelled", rejectionReason: "Fully booked" });
    expect(withReason.status).toBe(204);

    await prisma.appointment.delete({ where: { Id: created.Id } });
  });

  it("is unreachable without authentication", async () => {
    const res = await request(app).patch("/api/appointments/999999/status").send({ status: "Confirmed" });
    expect(res.status).toBe(401);
  });
});
