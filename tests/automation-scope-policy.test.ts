import { describe, expect, it } from "vitest";
import { AUTOMATION_SCOPE_MODE, getAutomationScopeNotice } from "@/lib/automation-scope-policy";

describe("automation scope policy", () => {
  it("keeps automations workspace-wide until a channel scope model exists", () => {
    expect(AUTOMATION_SCOPE_MODE).toBe("workspace");
    expect(getAutomationScopeNotice("channel-a")).toContain("工作區共用");
    expect(getAutomationScopeNotice("channel-a")).toContain("資料模型與 migration");
  });
});
