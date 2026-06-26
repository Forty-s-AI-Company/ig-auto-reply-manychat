import { expect, test } from "@playwright/test";
import dotenv from "dotenv";
import { getAuthenticatedRouteSmokeGuard } from "./authenticated-route-smoke-guard";

dotenv.config({ path: ".env", quiet: true });
dotenv.config({ path: ".env.local", override: true, quiet: true });

const loginRunId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

test.describe("simple release smoke", () => {
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const guard = getAuthenticatedRouteSmokeGuard();

  test.skip(!adminEmail || !adminPassword, "ADMIN_EMAIL and ADMIN_PASSWORD are required for authenticated smoke tests.");
  test.skip(guard.shouldSkip, guard.reason);
  test.skip(process.env.INBOXPILOT_RELEASE_CHANNEL !== "simple", "Simple release smoke requires INBOXPILOT_RELEASE_CHANNEL=simple.");

  test.beforeEach(async ({ page }, testInfo) => {
    const response = await page.request.post("/api/auth/login", {
      data: { email: adminEmail, password: adminPassword },
      headers: {
        origin: "http://127.0.0.1:3041",
        "x-forwarded-for": `simple-e2e-${loginRunId}-${testInfo.project.name}-${testInfo.workerIndex}-${testInfo.retry}-${testInfo.testId}`,
      },
    });
    expect(response.ok(), `login failed with ${response.status()}: ${await response.text()}`).toBeTruthy();
  });

  test("shows Meta OAuth failure copy and hides Facebook entry points", async ({ page }) => {
    const metaError =
      "Meta 未核發 Instagram 訊息讀取權限，請確認您的 Meta 應用是否已通過 App Review，或使用的是否為測試 Sandbox 帳號。";

    await page.goto(`/channels/connect/social?meta_error=${encodeURIComponent(metaError)}&meta_error_code=missing_permissions`, {
      waitUntil: "domcontentloaded",
    });

    await expect(page.getByText("連接失敗")).toBeVisible();
    await expect(page.locator("body")).toContainText(metaError);
    await expect(page.locator("body")).toContainText("錯誤代碼：missing_permissions");
    await expect(page.locator("body")).toContainText("Instagram OAuth");
    await expect(page.locator("body")).not.toContainText("Facebook / Meta Login");
    await expect(page.locator("body")).not.toContainText("meta-facebook");
  });

  test("gates billing with dashboard feature notice", async ({ page }) => {
    const response = await page.request.get("/billing", {
      maxRedirects: 0,
    });
    expect(response.status()).toBe(307);
    const location = new URL(response.headers()["location"] || "", "http://127.0.0.1:3041");
    expect(location.pathname).toBe("/dashboard");
    expect(location.searchParams.get("alert")).toBe("feature_gated");
    expect(location.searchParams.get("feature")).toBe("billing");

    await page.goto("/dashboard?alert=feature_gated&feature=billing", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("此功能目前受控開通")).toBeVisible();
    await expect(page.locator("body")).toContainText("金流");
    await expect(page.locator("body")).toContainText("https://staging.carry-digital-nomad.in.net");
  });
});
