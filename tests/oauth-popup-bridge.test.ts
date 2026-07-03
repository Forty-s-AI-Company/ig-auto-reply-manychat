import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(join(process.cwd(), "src/components/oauth/OAuthPopupBridge.tsx"), "utf8");

describe("OAuthPopupBridge feedback semantics", () => {
  it("announces failed popup callbacks as alerts and successful callbacks as status updates", () => {
    expect(source).toContain('const isError = payload.status === "error";');
    expect(source).toContain('role={isError ? "alert" : "status"}');
    expect(source).toContain('data-testid="oauth-popup-bridge-status"');
    expect(source).toContain("border-red-200 text-red-900");
  });
});
