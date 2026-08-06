import { describe, expect, it, afterAll, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../index";
import { prisma } from "../lib/prisma";

let agent: ReturnType<typeof request.agent>;
let categoryId: number;

beforeAll(async () => {
  agent = request.agent(app);
  await agent.post("/api/auth/login").send({ username: "admin", password: "admin123" });

  const category = await prisma.serviceCategory.create({
    data: { Name: "Vitest Category", Slug: `vitest-cat-${Date.now()}`, SortOrder: 0, IsActive: true },
  });
  categoryId = category.Id;
});

afterAll(async () => {
  await prisma.serviceCategory.delete({ where: { Id: categoryId } });
  await prisma.$disconnect();
});

describe("Service item discount validation", () => {
  it("rejects a discount percent above 100", async () => {
    const res = await agent.post("/api/services/items").send({
      serviceCategoryId: categoryId,
      name: "Bad Discount Item",
      price: 100,
      discountPercent: 150,
    });
    expect(res.status).toBe(400);
  });

  it("rejects a negative discount percent", async () => {
    const res = await agent.post("/api/services/items").send({
      serviceCategoryId: categoryId,
      name: "Bad Discount Item",
      price: 100,
      discountPercent: -5,
    });
    expect(res.status).toBe(400);
  });

  it("accepts a valid discount percent within 0-100", async () => {
    const res = await agent.post("/api/services/items").send({
      serviceCategoryId: categoryId,
      name: "Good Discount Item",
      price: 100,
      discountPercent: 20,
    });
    expect(res.status).toBe(200);
    expect(res.body.discountPercent).toBe(20);

    await prisma.serviceItem.delete({ where: { Id: res.body.id } });
  });
});

describe("Callback request phone validation", () => {
  it("rejects a phone number that isn't exactly 10 digits", async () => {
    const res = await request(app).post("/api/callback-requests").send({ phoneNo: "123" });
    expect(res.status).toBe(400);
  });

  it("accepts a valid 10-digit phone number", async () => {
    const res = await request(app).post("/api/callback-requests").send({ phoneNo: "9123456789" });
    expect(res.status).toBe(200);

    await prisma.callbackRequest.delete({ where: { Id: res.body.id } });
  });
});
