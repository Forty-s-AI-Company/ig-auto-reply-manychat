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

  async function selectSidebarInstagramChannel(page: import("@playwright/test").Page, channelName: string, excludeText?: string) {
    await page.locator('[data-testid="account-dropdown-trigger"]:visible').click();
    const option = page.locator('[data-testid="account-channel-option"]:visible').filter({ hasText: channelName });
    await (excludeText ? option.filter({ hasNotText: excludeText }) : option).click();
  }

  test("loads, scopes by Instagram channel, filters, selects a conversation, and shows clear send feedback", async ({ page }, testInfo) => {
    const isMobileProject = testInfo.project.name.includes("mobile");

    await page.goto("/inbox", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("inbox-client")).toHaveAttribute("data-ready", "true");
    await expect(page.locator("body")).toContainText("E2E Inbox 主要對話");

    if (isMobileProject) await page.getByRole("button", { name: "開啟選單" }).click();
    await selectSidebarInstagramChannel(page, "E2E Alt");
    if (isMobileProject) await page.getByRole("button", { name: "關閉選單", exact: true }).click().catch(() => {});
    await expect(page.locator("body")).toContainText("E2E Inbox 第二 IG channel scope 對話");
    await expect(page.locator("body")).not.toContainText("E2E Inbox 主要對話");

    if (isMobileProject) await page.getByRole("button", { name: "開啟選單" }).click();
    await selectSidebarInstagramChannel(page, "E2E", "Alt");
    if (isMobileProject) await page.getByRole("button", { name: "關閉選單", exact: true }).click().catch(() => {});
    await expect(page.locator("body")).toContainText("E2E Inbox 主要對話");
    await expect(page.locator("body")).not.toContainText("E2E Inbox 第二 IG channel scope 對話");

    const searchInput = isMobileProject ? page.getByTestId("inbox-mobile-search") : page.getByPlaceholder("搜尋收件匣對話");
    await searchInput.fill("未讀篩選");
    await expect(page.locator("body")).toContainText("E2E Inbox 未讀篩選對話");
    await expect(page.locator("body")).not.toContainText("E2E Inbox 主要對話");

    if (isMobileProject) {
      await page.getByTestId("inbox-mobile-filter-button").click();
    } else {
      await page.getByRole("button", { name: "篩選", exact: true }).click();
    }
    await expect(page.getByTestId("inbox-filter-panel")).toBeVisible();
    await page.getByTestId("inbox-filter-unread").check();
    await expect(page.locator("body")).toContainText("E2E Inbox 未讀篩選對話");

    await searchInput.fill("");
    await page.getByTestId("inbox-filter-unread").uncheck();
    await page.getByTestId("inbox-close-filter-panel").click();
    await expect(page.getByTestId("inbox-filter-panel")).toBeHidden();
    await page.getByTestId("inbox-select-all").check();
    await expect(page.locator("body")).toContainText(/標記已讀 \d+/);

    await page.getByText("E2E Inbox 主要對話").click();
    await expect(page.getByText("E2E 測試聯絡人 A").first()).toBeVisible();

    if (!isMobileProject) {
      await page.getByTestId("inbox-contact-actions-button").click();
      await expect(page.getByTestId("inbox-contact-actions-menu")).toBeVisible();
      await expect(page.getByTestId("inbox-contact-actions-menu")).toContainText("開啟聯絡人詳情");
      await page.getByRole("button", { name: "匯出聯絡人資料" }).click();
      await expect(page.getByTestId("inbox-notice")).toContainText("匯出聯絡人資料目前已暫時停用");
      await expect(page.getByTestId("inbox-notice")).not.toContainText("尚未開放");
      await page.getByRole("button", { name: "封鎖 / 解除訂閱" }).click();
      await expect(page.getByTestId("inbox-notice")).toContainText("封鎖或解除訂閱操作目前已暫時停用");
      await expect(page.getByTestId("inbox-notice")).not.toContainText("尚未開放");
    }

    await page.getByRole("button", { name: "AI 回覆建議" }).click();
    await expect(page.getByTestId("inbox-composer-textarea")).toHaveValue(/謝謝您的訊息/);
    await expect(page.getByTestId("inbox-notice")).toContainText(/已依最新訊息產生.+回覆草稿/);
    await expect(page.getByTestId("inbox-notice")).not.toContainText("尚未開放");

    await page.getByTestId("inbox-composer-textarea").fill("");
    await page.getByRole("button", { name: "表情符號" }).click();
    await expect(page.getByTestId("inbox-composer-textarea")).toHaveValue("😊");
    await expect(page.getByTestId("inbox-notice")).toContainText("已加入表情符號");
    await expect(page.getByTestId("inbox-notice")).not.toContainText("尚未開放");

    await page.getByRole("button", { name: /圖片上傳/ }).click();
    await expect(page.getByTestId("inbox-notice")).toContainText("圖片上傳 目前已暫時停用");
    await expect(page.getByTestId("inbox-notice")).toContainText("媒體儲存、掃毒與 Instagram 附件送出流程");
    await expect(page.getByTestId("inbox-notice")).not.toContainText("尚未開放");

    await page.getByRole("button", { name: /語音訊息/ }).click();
    await expect(page.getByTestId("inbox-notice")).toContainText("語音訊息 目前已暫時停用");
    await expect(page.getByTestId("inbox-notice")).toContainText("音訊上傳、格式轉換與 Instagram 附件送出流程");
    await expect(page.getByTestId("inbox-notice")).not.toContainText("尚未開放");

    await page.getByTestId("inbox-video-call-button").click();
    await expect(page.getByTestId("inbox-notice")).toContainText("視訊通話 目前已暫時停用");
    await expect(page.getByTestId("inbox-notice")).toContainText("即時通話服務、權限控管與客服排班流程");
    await expect(page.getByTestId("inbox-notice")).not.toContainText("尚未開放");

    await page.getByTestId("inbox-more-actions-button").click();
    await expect(page.getByTestId("inbox-notice")).toContainText("更多對話操作 目前已暫時停用");
    await expect(page.getByTestId("inbox-notice")).toContainText("批次封存、匯出、轉交與封鎖");
    await expect(page.getByTestId("inbox-notice")).not.toContainText("尚未開放");

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
