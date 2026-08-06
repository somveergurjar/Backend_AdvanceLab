import { describe, expect, it, afterAll } from "vitest";
import request from "supertest";
import { app } from "../index";
import { prisma } from "../lib/prisma";

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/auth/login", () => {
  it("rejects invalid credentials without leaking whether the username exists", async () => {
    const res = await request(app).post("/api/auth/login").send({ username: "admin", password: "wrong-password" });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid username or password.");
  });

  it("rejects a malformed body via zod validation before touching the database", async () => {
    const res = await request(app).post("/api/auth/login").send({ username: "" });
    expect(res.status).toBe(400);
  });

  it("logs in successfully and sets an httpOnly session cookie, never the raw token in the body", async () => {
    const res = await request(app).post("/api/auth/login").send({ username: "admin", password: "admin123" });
    expect(res.status).toBe(200);
    expect(res.body.username).toBe("admin");
    expect(res.body.token).toBeUndefined();

    const cookie = res.headers["set-cookie"]?.[0];
    expect(cookie).toBeDefined();
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("adl_session=");
  });
});

describe("Authenticated session flow", () => {
  it("rejects /api/auth/me with no session cookie", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("allows /api/auth/me with a valid session cookie, and logout clears it", async () => {
    const agent = request.agent(app);
    await agent.post("/api/auth/login").send({ username: "admin", password: "admin123" });

    const me = await agent.get("/api/auth/me");
    expect(me.status).toBe(200);
    expect(me.body.username).toBe("admin");

    await agent.post("/api/auth/logout");
    const afterLogout = await agent.get("/api/auth/me");
    expect(afterLogout.status).toBe(401);
  });
});
