import { expect, test, type Page, type TestInfo } from "@playwright/test";
import dotenv from "dotenv";
import { getAuthenticatedRouteSmokeGuard } from "./authenticated-route-smoke-guard";

dotenv.config({ path: ".env", quiet: true });
dotenv.config({ path: ".env.local", override: true, quiet: true });

const loginRunId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const expectSimpleRelease =
  process.env.AI_TEAM_BROWSER_QA_EXPECT_SIMPLE_RELEASE === "true" ||
  process.env.INBOXPILOT_RELEASE_CHANNEL === "simple";

async function login(page: Page, testInfo: TestInfo, email: string, password: string) {
  const response = await page.request.post("/api/auth/login", {
    data: { email, password },
    headers: {
      origin: "http://127.0.0.1:3041",
      "x-forwarded-for": `ai-team-browser-smoke-${loginRunId}-${testInfo.project.name}-${testInfo.workerIndex}-${testInfo.retry}-${testInfo.testId}`,
    },
  });

  expect(response.ok(), `login failed with ${response.status()}: ${await response.text()}`).toBeTruthy();
}

async function expectNoOverflow(page: Page) {
  await page.waitForTimeout(150);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
}

test.describe("AI_TEAM browser smoke", () => {
  test.setTimeout(45_000);

  test("checks public landing and login shell quickly", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/InboxPilot/);
    await expect(page.locator("body")).toContainText(/InboxPilot/);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /登入|Login/ })).toBeVisible();
    await expect(page.getByLabel(/Email|電子郵件/)).toBeVisible();
    await expect(page.getByLabel(/Password|密碼/)).toBeVisible();
    await expectNoOverflow(page);
  });

  test("checks the critical simple-release and social-connect UX when auth is available", async ({ page }, testInfo) => {
    const adminEmail = process.env.ADMIN_EMAIL?.trim();
    const adminPassword = process.env.ADMIN_PASSWORD;
    const guard = getAuthenticatedRouteSmokeGuard();

    test.skip(!adminEmail || !adminPassword, "ADMIN_EMAIL and ADMIN_PASSWORD are required for authenticated browser smoke.");
    test.skip(guard.shouldSkip, guard.reason);

    await login(page, testInfo, adminEmail, adminPassword);

    const metaError =
      "Meta 未核發 Instagram 訊息讀取權限，請確認您的 Meta 應用是否已通過 App Review，或使用的是否為測試 Sandbox 帳號。";

    await page.goto(`/channels/connect/social?meta_error=${encodeURIComponent(metaError)}&meta_error_code=missing_permissions`, {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByText("連接失敗")).toBeVisible();
    await expect(page.locator("body")).toContainText(metaError);
    await expect(page.locator("body")).toContainText("錯誤代碼：missing_permissions");
    if (expectSimpleRelease) {
      await expect(page.locator("body")).not.toContainText("Facebook / Meta Login");
      await expect(page.locator("body")).not.toContainText("meta-facebook");
    }

    const response = await page.request.get("/billing", { maxRedirects: 0 });
    if (expectSimpleRelease) {
      expect(response.status()).toBe(307);
      const location = new URL(response.headers()["location"] || "", "http://127.0.0.1:3041");
      expect(location.pathname).toBe("/dashboard");
      expect(location.searchParams.get("alert")).toBe("feature_gated");
      expect(location.searchParams.get("feature")).toBe("billing");
    } else {
      expect(response.status()).toBe(200);
    }
  });
});
