import { afterEach, describe, expect, it } from "vitest";
import { FULL_ONLY_APP_ROUTE_PREFIXES, getReleaseChannelForHost, isFullOnlyAppPath } from "@/lib/release-mode";

const originalReleaseChannel = process.env.INBOXPILOT_RELEASE_CHANNEL;

describe("release mode", () => {
  afterEach(() => {
    if (originalReleaseChannel === undefined) {
      delete process.env.INBOXPILOT_RELEASE_CHANNEL;
    } else {
      process.env.INBOXPILOT_RELEASE_CHANNEL = originalReleaseChannel;
    }
  });

  it("defaults the production custom domain to simple release", () => {
    delete process.env.INBOXPILOT_RELEASE_CHANNEL;

    expect(getReleaseChannelForHost("inboxpilot.carry-digital-nomad.in.net")).toBe("simple");
    expect(getReleaseChannelForHost("inboxpilot.carry-digital-nomad.in.net:443")).toBe("simple");
  });

  it("defaults staging, preview, and localhost hosts to full release", () => {
    delete process.env.INBOXPILOT_RELEASE_CHANNEL;

    expect(getReleaseChannelForHost("staging.carry-digital-nomad.in.net")).toBe("full");
    expect(getReleaseChannelForHost("inboxpilot-git-staging-a25814740s-projects.vercel.app")).toBe("full");
    expect(getReleaseChannelForHost("localhost:3041")).toBe("full");
  });

  it("allows Vercel env to override host defaults", () => {
    process.env.INBOXPILOT_RELEASE_CHANNEL = "full";
    expect(getReleaseChannelForHost("inboxpilot.carry-digital-nomad.in.net")).toBe("full");

    process.env.INBOXPILOT_RELEASE_CHANNEL = "simple";
    expect(getReleaseChannelForHost("staging.carry-digital-nomad.in.net")).toBe("simple");
  });

  it("classifies full-only app routes", () => {
    for (const prefix of FULL_ONLY_APP_ROUTE_PREFIXES) {
      expect(isFullOnlyAppPath(prefix)).toBe(true);
      expect(isFullOnlyAppPath(`${prefix}/nested`)).toBe(true);
    }

    expect(isFullOnlyAppPath("/dashboard")).toBe(false);
    expect(isFullOnlyAppPath("/channels/connect/social")).toBe(false);
    expect(isFullOnlyAppPath("/automations")).toBe(false);
  });
});

