import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireApiUser: vi.fn(),
  applyAffiliate: vi.fn(),
  assertRateLimit: vi.fn(),
  assertSameOriginRequest: vi.fn(),
  getClientIp: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireApiUser: mocks.requireApiUser }));
vi.mock("@/lib/billing/affiliate-service", () => ({ applyAffiliate: mocks.applyAffiliate }));
vi.mock("@/lib/security", () => ({
  assertRateLimit: mocks.assertRateLimit,
  assertSameOriginRequest: mocks.assertSameOriginRequest,
  getClientIp: mocks.getClientIp,
}));

import * as applyRoute from "@/app/api/affiliate/apply/route";

function postRequest() {
  return new Request("http://local.test/api/affiliate/apply", { method: "POST" });
}

describe("affiliate apply route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireApiUser.mockResolvedValue({ user: { id: "user-1" }, response: null });
    mocks.applyAffiliate.mockResolvedValue({ id: "profile-1", status: "pending" });
    mocks.assertSameOriginRequest.mockReturnValue(null);
    mocks.assertRateLimit.mockResolvedValue(null);
    mocks.getClientIp.mockReturnValue("127.0.0.1");
  });

  it("requires same-origin and rate limits affiliate applications", async () => {
    const response = await applyRoute.POST(postRequest());
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(mocks.assertSameOriginRequest).toHaveBeenCalledOnce();
    expect(mocks.assertRateLimit).toHaveBeenCalledWith({
      key: "affiliate-apply:user-1:127.0.0.1",
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
    expect(mocks.applyAffiliate).toHaveBeenCalledWith("user-1");
  });

  it("stops before auth when the origin guard fails", async () => {
    const blocked = new Response("forbidden", { status: 403 });
    mocks.assertSameOriginRequest.mockReturnValue(blocked);

    const response = await applyRoute.POST(postRequest());

    expect(response.status).toBe(403);
    expect(mocks.requireApiUser).not.toHaveBeenCalled();
    expect(mocks.applyAffiliate).not.toHaveBeenCalled();
  });

  it("stops before applying when rate limited", async () => {
    const blocked = new Response("too many requests", { status: 429 });
    mocks.assertRateLimit.mockResolvedValue(blocked);

    const response = await applyRoute.POST(postRequest());

    expect(response.status).toBe(429);
    expect(mocks.applyAffiliate).not.toHaveBeenCalled();
  });
});
