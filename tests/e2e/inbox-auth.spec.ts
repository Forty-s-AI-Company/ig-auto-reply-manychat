import { expect, test } from "@playwright/test";
import dotenv from "dotenv";
import { getAuthenticatedRouteSmokeGuard } from "./authenticated-route-smoke-guard";

dotenv.config({ path: ".env", quiet: true });
dotenv.config({ path: ".env.local", override: true, quiet: true });

const loginRunId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

test.describe("inbox authenticated smoke", () => {
  test.setTimeout(60_000);
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const guard = getAuthenticatedRouteSmokeGuard();

  test.skip(!adminEmail || !adminPassword, "ADMIN_EMAIL and ADMIN_PASSWORD are required for authenticated smoke tests.");
  test.skip(guard.shouldSkip, guard.reason);

  test.beforeEach(async ({ page }, testInfo) => {
    const response = await page.request.post("/api/auth/login", {
      data: { email: adminEmail, password: adminPassword },
      headers: {
        origin: "http://127.0.0.1:3041",
        "x-forwarded-for": `inbox-e2e-${loginRunId}-${testInfo.project.name}-${testInfo.workerIndex}-${testInfo.retry}-${testInfo.testId}`,
      },
    });
    expect(response.ok(), `login failed with ${response.status()}: ${await response.text()}`).toBeTruthy();
  });

  test("loads, scopes by Instagram channel, filters, selects a conversation, and shows clear send feedback", async ({ page }, testInfo) => {
    const isMobileProject = testInfo.project.name.includes("mobile");

    await page.goto("/inbox", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("inbox-client")).toHaveAttribute("data-ready", "true");
    await expect(page.locator("body")).toContainText("E2E Inbox 主要對話");

    if (isMobileProject) await page.getByRole("button", { name: "開啟選單" }).click();
    await page.getByRole("button", { name: /E2E/ }).first().click();
    await page.getByRole("button", { name: /E2E Alt/ }).click();
    if (isMobileProject) await page.getByRole("button", { name: "關閉選單", exact: true }).click().catch(() => {});
    await expect(page.locator("body")).toContainText("E2E Inbox 第二 IG channel scope 對話");
    await expect(page.locator("body")).not.toContainText("E2E Inbox 主要對話");

    if (isMobileProject) await page.getByRole("button", { name: "開啟選單" }).click();
    await page.getByRole("button", { name: /E2E Alt/ }).first().click();
    await page.locator("button").filter({ hasText: "E2E", hasNotText: "Alt" }).last().click();
    if (isMobileProject) await page.getByRole("button", { name: "關閉選單", exact: true }).click().catch(() => {});
    await expect(page.locator("body")).toContainText("E2E Inbox 主要對話");
    await expect(page.locator("body")).not.toContainText("E2E Inbox 第二 IG channel scope 對話");

    await page.getByPlaceholder("搜尋收件匣對話").fill("未讀篩選");
    await expect(page.locator("body")).toContainText("E2E Inbox 未讀篩選對話");
    await expect(page.locator("body")).not.toContainText("E2E Inbox 主要對話");

    await page.getByRole("button", { name: "篩選", exact: true }).click();
    await expect(page.getByTestId("inbox-filter-panel")).toBeVisible();
    await page.getByTestId("inbox-filter-unread").check();
    await expect(page.locator("body")).toContainText("E2E Inbox 未讀篩選對話");

    await page.getByPlaceholder("搜尋收件匣對話").fill("");
    await page.getByTestId("inbox-filter-unread").uncheck();
    await page.getByTestId("inbox-select-all").check();
    await expect(page.locator("body")).toContainText(/標記已讀 \d+/);

    await page.getByText("E2E Inbox 主要對話").click();
    await expect(page.getByText("E2E 測試聯絡人 A").first()).toBeVisible();

    await page.getByRole("button", { name: "備註", exact: true }).click();
    await page.getByTestId("inbox-composer-textarea").fill(`E2E internal note ${Date.now()}`);
    await page.getByTestId("inbox-send-message").click();
    await expect(page.getByTestId("inbox-notice")).toContainText("內部備註已儲存");

    await page.getByRole("button", { name: "回覆", exact: true }).click();
    await page.getByTestId("inbox-composer-textarea").fill(`E2E outbound reply ${Date.now()}`);
    await page.getByTestId("inbox-send-message").click();
    await expect(page.getByTestId("inbox-notice")).toContainText(/訊息已送出到 Instagram|Instagram 回覆未送出/);
  });
});
