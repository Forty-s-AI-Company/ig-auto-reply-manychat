import { afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

const originalReleaseChannel = process.env.INBOXPILOT_RELEASE_CHANNEL;

function request(url: string, init?: RequestInit) {
  return new NextRequest(url, init);
}

describe("release proxy smoke tests", () => {
  afterEach(() => {
    if (originalReleaseChannel === undefined) {
      delete process.env.INBOXPILOT_RELEASE_CHANNEL;
    } else {
      process.env.INBOXPILOT_RELEASE_CHANNEL = originalReleaseChannel;
    }
  });

  it("redirects full-only app routes on the simple production host", () => {
    delete process.env.INBOXPILOT_RELEASE_CHANNEL;

    const response = proxy(request("https://inboxpilot.carry-digital-nomad.in.net/billing"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://inboxpilot.carry-digital-nomad.in.net/dashboard");
  });

  it("does not redirect full-only app routes on staging full release", () => {
    delete process.env.INBOXPILOT_RELEASE_CHANNEL;

    const response = proxy(request("https://staging.carry-digital-nomad.in.net/billing"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("blocks non-Instagram OAuth APIs on the simple production host", async () => {
    delete process.env.INBOXPILOT_RELEASE_CHANNEL;

    const response = proxy(request("https://inboxpilot.carry-digital-nomad.in.net/api/oauth/meta-facebook/authorize"));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Provider is not available on the simple production release." });
  });

  it("keeps Instagram OAuth APIs available on the simple production host", () => {
    delete process.env.INBOXPILOT_RELEASE_CHANNEL;

    const response = proxy(request("https://inboxpilot.carry-digital-nomad.in.net/api/oauth/meta-instagram/authorize"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("lets the full release env override expose full routes on production host", () => {
    process.env.INBOXPILOT_RELEASE_CHANNEL = "full";

    const response = proxy(request("https://inboxpilot.carry-digital-nomad.in.net/billing"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});

