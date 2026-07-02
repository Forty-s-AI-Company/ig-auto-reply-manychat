import { expect, test, type Page, type TestInfo } from "@playwright/test";
import dotenv from "dotenv";
import { getAuthenticatedRouteSmokeGuard } from "./authenticated-route-smoke-guard";

dotenv.config({ path: ".env", quiet: true });
dotenv.config({ path: ".env.local", override: true, quiet: true });

const emptyAdminEmail = process.env.EMPTY_E2E_ADMIN_EMAIL?.trim() || "empty-e2e-admin@example.com";
const emptyAdminPassword = process.env.EMPTY_E2E_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
const loginRunId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const guard = getAuthenticatedRouteSmokeGuard();

async function loginAsEmptyWorkspaceAdmin(page: Page, testInfo: TestInfo) {
  const response = await page.request.post("/api/auth/login", {
    data: { email: emptyAdminEmail, password: emptyAdminPassword },
    headers: {
      origin: "http://127.0.0.1:3041",
      "x-forwarded-for": `empty-workspace-e2e-${loginRunId}-${testInfo.project.name}-${testInfo.workerIndex}-${testInfo.retry}-${testInfo.testId}`,
    },
  });

  expect(response.ok(), `empty workspace login failed with ${response.status()}: ${await response.text()}`).toBeTruthy();
}

async function expectNoHorizontalOverflow(page: Page) {
  await page.waitForTimeout(150);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
}

test.describe("empty workspace activation path", () => {
  test.setTimeout(60_000);
  test.skip(!emptyAdminPassword, "EMPTY_E2E_ADMIN_PASSWORD or ADMIN_PASSWORD is required for empty workspace smoke.");
  test.skip(guard.shouldSkip, guard.reason);

  test.beforeEach(async ({ page }, testInfo) => {
    await loginAsEmptyWorkspaceAdmin(page, testInfo);
  });

  test("walks Dashboard, Channels connect, Inbox, Contacts, and Automations empty states", async ({ page }, testInfo) => {
    const isMobileProject = testInfo.project.name.includes("mobile");
    if (!isMobileProject) {
      await page.setViewportSize({ width: 1366, height: 768 });
    }

    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /首頁|儀表板/ }).first()).toBeVisible();
    await expect(page.locator("body")).toContainText("IG 連線");
    await expect(page.locator("body")).toContainText("0 個帳號");
    await expect(page.getByTestId("dashboard-recent-messages-empty")).toBeVisible();
    await expect(page.getByTestId("dashboard-recent-messages-empty-cta")).toHaveAttribute("href", "/channels/connect");
    await expect(page.getByTestId("dashboard-recent-automations-empty")).toBeVisible();
    await expect(page.getByTestId("dashboard-recent-automations-empty-cta")).toHaveAttribute("href", "/automations");
    await expectNoHorizontalOverflow(page);

    await page.goto("/channels/connect", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "連接平台帳號" })).toBeVisible();
    await expect(page.locator("body")).toContainText("目前可連線");
    await expect(page.locator("body")).toContainText("Instagram");
    await expect(page.locator("body")).toContainText("規劃中與受控開通");
    await expectNoHorizontalOverflow(page);

    await page.goto("/inbox", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "收件匣" }).first()).toBeVisible();
    await expect(page.getByTestId("inbox-empty-onboarding")).toBeVisible();
    await expect(page.getByTestId("inbox-empty-onboarding")).toContainText("還沒有任何對話");
    await expect(page.getByTestId("inbox-empty-connect-instagram")).toHaveAttribute("href", "/channels/connect");
    await expect(page.getByTestId("inbox-empty-open-dashboard")).toHaveAttribute("href", "/dashboard");
    await expect(page.getByTestId("inbox-empty-manage-tags")).toHaveAttribute("href", "/contacts");
    await expectNoHorizontalOverflow(page);

    await page.goto("/contacts", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "聯絡人" }).first()).toBeVisible();
    await expect(page.locator("body")).toContainText("目前還沒有聯絡人");
    await expect(page.locator("body")).toContainText("現在可以先連接 Instagram 帳號");
    await expect(page.locator("body")).toContainText("前往標籤管理");
    await expect(page.locator("body")).toContainText("CSV 匯入不是壞掉");
    await expectNoHorizontalOverflow(page);

    await page.goto("/automations", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "自動化" }).first()).toBeVisible();
    await expect(page.getByTestId("automation-list-empty")).toBeVisible();
    await expect(page.getByTestId("automation-list-empty")).toContainText("新工作區可以先從 Instagram 預設回覆或空白流程開始");
    await expect(page.getByTestId("automation-empty-create-cta")).toBeVisible();
    await expect(page.getByTestId("automation-empty-basic-cta")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});
