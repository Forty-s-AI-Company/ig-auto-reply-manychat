import { afterEach, describe, expect, it, vi } from "vitest";

import { getInstagramAppSecret } from "../src/app/api/meta/oauth/callback/route";

describe("Meta OAuth configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("requires a dedicated Instagram app secret when Instagram and Facebook app IDs differ", () => {
    vi.stubEnv("META_INSTAGRAM_APP_ID", "instagram-app-id");
    vi.stubEnv("META_APP_ID", "facebook-app-id");
    vi.stubEnv("META_INSTAGRAM_APP_SECRET", "");
    vi.stubEnv("META_APP_SECRET", "facebook-secret");

    expect(() => getInstagramAppSecret()).toThrow("META_INSTAGRAM_APP_SECRET is required");
  });

  it("uses the Instagram app secret for Instagram Login", () => {
    vi.stubEnv("META_INSTAGRAM_APP_ID", "instagram-app-id");
    vi.stubEnv("META_APP_ID", "facebook-app-id");
    vi.stubEnv("META_INSTAGRAM_APP_SECRET", "instagram-secret");
    vi.stubEnv("META_APP_SECRET", "facebook-secret");

    expect(getInstagramAppSecret()).toBe("instagram-secret");
  });
});
