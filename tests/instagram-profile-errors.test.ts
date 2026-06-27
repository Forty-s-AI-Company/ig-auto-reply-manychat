import { describe, expect, it } from "vitest";
import { getSafeInstagramProfileRefreshError } from "@/lib/channels/instagram-profile-errors";

describe("getSafeInstagramProfileRefreshError", () => {
  it("redacts stored raw Meta unsupported request messages", () => {
    const message = getSafeInstagramProfileRefreshError(
      "Unsupported request - method type: get fbtrace_id=Abtoc-Z9F0tUhpSEoCG12Gx",
    );

    expect(message).toContain("Meta 目前沒有允許");
    expect(message).not.toContain("Unsupported request");
    expect(message).not.toContain("fbtrace");
    expect(message).not.toContain("Abtoc");
  });

  it("returns a safe permission message without echoing token details", () => {
    const message = getSafeInstagramProfileRefreshError("Invalid OAuth access token");

    expect(message).toContain("Instagram 授權不足");
    expect(message).not.toContain("OAuth access token");
  });
});
