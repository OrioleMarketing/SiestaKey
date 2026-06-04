import { describe, it, expect } from "vitest";

const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

describe("GoHighLevel API credentials", () => {
  it("should have GHL_API_KEY and GHL_LOCATION_ID set", () => {
    expect(GHL_API_KEY).toBeTruthy();
    expect(GHL_LOCATION_ID).toBeTruthy();
  });

  it("should successfully authenticate with GHL API", async () => {
    const res = await fetch(
      `https://services.leadconnectorhq.com/contacts/?locationId=${GHL_LOCATION_ID}&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${GHL_API_KEY}`,
          Version: "2021-07-28",
          "Content-Type": "application/json",
        },
      }
    );
    // 200 = valid key, 401 = invalid key, 403 = wrong scopes
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
    expect([200, 422]).toContain(res.status);
  }, 15000);
});
