import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("sale ready polish guards", () => {
  it("uses dashboard toast redirects for gated simple-release routes", () => {
    const proxySource = readFileSync("src/proxy.ts", "utf8");
    const dashboardSource = readFileSync("src/app/dashboard/page.tsx", "utf8");

    expect(proxySource).toContain('url.searchParams.set("toast", "feature_gated")');
    expect(proxySource).toContain("NextResponse.redirect(url, 303)");
    expect(dashboardSource).toContain('params.toast === "feature_gated" || params.alert === "feature_gated"');
    expect(dashboardSource).toContain("本功能在目前版本尚未開放");
  });

  it("keeps destructive automation and segment actions on custom dialogs instead of native confirm", () => {
    const automationSource = readFileSync("src/components/AutomationBuilderClient.tsx", "utf8");
    const segmentSource = readFileSync("src/components/SegmentsClient.tsx", "utf8");

    expect(automationSource).not.toContain("window.confirm");
    expect(segmentSource).not.toContain("window.confirm");
    expect(automationSource).toContain('data-testid="automation-delete-dialog"');
    expect(automationSource).toContain('data-testid="automation-node-delete-dialog"');
    expect(segmentSource).toContain('data-testid="segments-delete-dialog"');
  });

  it("shows pending feedback for logout and PayUNI return transitions", () => {
    const profileSource = readFileSync("src/components/InboxPilotProfileMenu.tsx", "utf8");
    const payuniReturnSource = readFileSync("src/app/api/billing/payuni/return/route.ts", "utf8");

    expect(profileSource).toContain("Loader2");
    expect(profileSource).toContain("animate-spin");
    expect(profileSource).toContain("disabled={loggingOut}");
    expect(payuniReturnSource).toContain("驗證付款中...");
    expect(payuniReturnSource).toContain("正在確認付款結果");
    expect(payuniReturnSource).not.toContain("PayUNI Sandbox 回傳結果");
    expect(payuniReturnSource).toContain("content-type");
  });

  it("keeps local dev login and inbox tag rendering protected against regressions", () => {
    const packageJson = readFileSync("package.json", "utf8");
    const ensureAdminSource = readFileSync("scripts/ensure-admin.ts", "utf8");
    const inboxPageSource = readFileSync("src/app/inbox/page.tsx", "utf8");

    expect(packageJson).toContain("npm run admin:ensure && next dev -p 3041");
    expect(ensureAdminSource).toContain("process.env.ADMIN_EMAIL");
    expect(ensureAdminSource).toContain("process.env.ADMIN_PASSWORD");
    expect(ensureAdminSource).toContain("Default Workspace");
    expect(inboxPageSource).toContain("const uniqueTags = Array.from(new Map(tags.map((tag) => [tag.id, tag])).values())");
    expect(inboxPageSource).toContain("JSON.stringify(uniqueTags)");
  });
});
