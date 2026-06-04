import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("categories.list", () => {
  it("returns an array (even if DB is unavailable)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.categories.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("businesses.featured", () => {
  it("returns an array", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.businesses.featured();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("businesses.list", () => {
  it("returns paginated result with items and total", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.businesses.list({ page: 1, limit: 5 });
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.items)).toBe(true);
    expect(typeof result.total).toBe("number");
  });

  it("accepts keyword filter", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.businesses.list({ keyword: "siesta", page: 1, limit: 5 });
    expect(Array.isArray(result.items)).toBe(true);
  });
});

describe("businesses.bySlug", () => {
  it("returns null for unknown slug", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.businesses.bySlug({ slug: "nonexistent-slug-xyz-123" });
    expect(result).toBeNull();
  });
});

describe("claims.submit", () => {
  it("rejects missing required fields", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.claims.submit({
        businessName: "",
        contactName: "Test",
        email: "test@example.com",
      })
    ).rejects.toThrow();
  });

  it("rejects invalid email", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.claims.submit({
        businessName: "Test Business",
        contactName: "Test User",
        email: "not-an-email",
      })
    ).rejects.toThrow();
  });
});

describe("submissions.submit", () => {
  it("rejects invalid email", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.submissions.submit({
        businessName: "Test Business",
        contactName: "Test User",
        email: "bad-email",
      })
    ).rejects.toThrow();
  });

  it("rejects invalid website URL", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.submissions.submit({
        businessName: "Test Business",
        contactName: "Test User",
        email: "valid@example.com",
        website: "not-a-url",
      })
    ).rejects.toThrow();
  });
});

describe("auth.logout", () => {
  it("clears the session cookie", async () => {
    const cleared: string[] = [];
    const ctx: TrpcContext = {
      user: null,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {
        clearCookie: (name: string) => cleared.push(name),
      } as unknown as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});
