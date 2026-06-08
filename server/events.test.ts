import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("events.list (public procedure)", () => {
  it("requires a positive businessId", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.events.list({ businessId: 0 })
    ).rejects.toThrow();
  });

  it("accepts a valid businessId and returns an array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    // businessId 999999 does not exist — should return empty array, not throw
    const result = await caller.events.list({ businessId: 999999 });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("events.listAll (admin procedure)", () => {
  it("rejects unauthenticated callers", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.events.listAll()).rejects.toThrow();
  });

  it("allows admin callers and returns an array", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.events.listAll();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("events.upsert (admin procedure)", () => {
  it("rejects unauthenticated callers", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.events.upsert({
        businessId: 1,
        type: "event",
        title: "Test Event",
        isPublished: true,
      })
    ).rejects.toThrow();
  });

  it("rejects an empty title", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await expect(
      caller.events.upsert({
        businessId: 1,
        type: "event",
        title: "",
        isPublished: true,
      })
    ).rejects.toThrow();
  });

  it("rejects a non-existent businessId with NOT_FOUND", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await expect(
      caller.events.upsert({
        businessId: 999999,
        type: "event",
        title: "Ghost Event",
        isPublished: true,
      })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("events.delete (admin procedure)", () => {
  it("rejects unauthenticated callers", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.events.delete({ id: 1 })).rejects.toThrow();
  });

  it("rejects a non-positive id", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    await expect(caller.events.delete({ id: 0 })).rejects.toThrow();
  });

  it("succeeds (no-op) when deleting a non-existent event id", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    // deleteEvent is a no-op for missing rows — should not throw
    const result = await caller.events.delete({ id: 999999 });
    expect(result).toEqual({ success: true });
  });
});
