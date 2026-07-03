import { expect, test, type Page, type TestInfo } from "@playwright/test";
import dotenv from "dotenv";
import { getAuthenticatedRouteSmokeGuard } from "./authenticated-route-smoke-guard";

dotenv.config({ path: ".env", quiet: true });
dotenv.config({ path: ".env.local", override: true, quiet: true });

const reviewerEmail = process.env.REVIEWER_E2E_ADMIN_EMAIL?.trim() || "reviewer-e2e-admin@example.com";
const reviewerPassword =
  process.env.REVIEWER_E2E_ADMIN_PASSWORD || process.env.EMPTY_E2E_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;
const loginRunId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const guard = getAuthenticatedRouteSmokeGuard();

async function loginAsReviewer(page: Page, testInfo: TestInfo) {
  const response = await page.request.post("/api/auth/login", {
    data: { email: reviewerEmail, password: reviewerPassword },
    headers: {
      origin: "http://127.0.0.1:3041",
      "x-forwarded-for": `reviewer-rehearsal-${loginRunId}-${testInfo.project.name}-${testInfo.workerIndex}-${testInfo.retry}-${testInfo.testId}`,
    },
  });

  expect(response.ok(), `reviewer rehearsal login failed with ${response.status()}: ${await response.text()}`).toBeTruthy();
}

async function expectNoHorizontalOverflow(page: Page) {
  await page.waitForTimeout(150);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
}

test.describe("meta reviewer-safe rehearsal smoke", () => {
  test.setTimeout(60_000);
  test.skip(!reviewerPassword, "REVIEWER_E2E_ADMIN_PASSWORD, EMPTY_E2E_ADMIN_PASSWORD, or ADMIN_PASSWORD is required.");
  test.skip(guard.shouldSkip, guard.reason);

  test.beforeEach(async ({ page }, testInfo) => {
    await loginAsReviewer(page, testInfo);
  });

  test("walks reviewer-safe dashboard, channels, inbox, contacts, and automations flows", async ({ page }, testInfo) => {
    const isMobileProject = testInfo.project.name.includes("mobile");
    if (!isMobileProject) {
      await page.setViewportSize({ width: 1366, height: 768 });
    }

    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /首頁|儀表板/ }).first()).toBeVisible();
    await expect(page.locator("body")).toContainText("查看收件匣");
    await expect(page.locator("body")).toContainText("連接 Instagram");
    await expect(page.locator("body")).toContainText("Review Channel");
    await expectNoHorizontalOverflow(page);

    await page.goto("/channels", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /設定|工作區、Instagram 與自動化設定/ }).first()).toBeVisible();
    await expect(page.locator("body")).toContainText("Review Channel");
    await expect(page.locator("body")).toContainText("尚未連結 Instagram 帳號");
    await expect(page.locator("body")).not.toContainText("Instagram E2E");
    await expectNoHorizontalOverflow(page);

    await page.goto("/channels/connect/social", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "連接社群帳號" })).toBeVisible();
    await expect(page.locator("body")).toContainText("Instagram OAuth");
    await expect(page.locator("body")).toContainText("還沒有任何社群登入連接");
    await expect(page.locator("body")).not.toContainText("Instagram E2E");
    await expectNoHorizontalOverflow(page);

    await page.goto("/inbox", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "收件匣" }).first()).toBeVisible();
    await expect(page.getByTestId("inbox-conversation-row").filter({ hasText: "Meta Reviewer Test Contact" }).first()).toBeVisible();
    await page.getByTestId("inbox-conversation-row").filter({ hasText: "Meta Reviewer Test Contact" }).first().click();
    await expect(page.locator("body")).toContainText("Hi, I want product information.");
    await expect(page.locator("body")).not.toContainText("E2E Inbox");
    await expectNoHorizontalOverflow(page);

    await page.goto("/contacts", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "聯絡人" }).first()).toBeVisible();
    await expect(page.locator("body")).toContainText("Meta Reviewer Test Contact");
    await expect(page.locator("body")).toContainText("reviewer-safe");
    await expect(page.locator("body")).not.toContainText("E2E 測試聯絡人");
    await expectNoHorizontalOverflow(page);

    await page.goto("/automations", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "自動化" }).first()).toBeVisible();
    await expect(page.locator("body")).toContainText("Meta Review Keyword Reply");
    await expect(page.locator("body")).toContainText("關鍵字 / 留言");
    await expect(page.locator("body")).not.toContainText("demo-keyword-automation");
    await expectNoHorizontalOverflow(page);
  });
});
