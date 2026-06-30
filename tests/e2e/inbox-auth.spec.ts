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
  const adminName = process.env.ADMIN_NAME?.trim() || "Admin";
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
    if (isMobileProject) await page.getByRole("button", { name: "開啟選單" }).click();
    await selectSidebarInstagramChannel(page, "E2E", "Alt");
    if (isMobileProject) await page.getByRole("button", { name: "關閉選單", exact: true }).click().catch(() => {});
    await expect(page.locator("body")).toContainText("E2E 測試聯絡人 A");
    await expect(page.locator("body")).not.toContainText("E2E 第二 IG 帳號聯絡人");

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

    await page.getByTestId("inbox-conversation-row").filter({ hasText: "E2E 測試聯絡人 A" }).first().click();
    if (isMobileProject) {
      await expect(page.getByTestId("inbox-composer-textarea")).toBeVisible();
      await page.getByTestId("inbox-pane-contact").click();
      await expect(page.locator('section:has-text("聯絡人標籤")')).toBeVisible();
    } else {
      await expect(page.getByText("E2E 測試聯絡人 A").first()).toBeVisible();
    }
    await expect(page.getByTestId("inbox-contact-avatar")).toBeVisible();
    await expect(page.getByTestId("inbox-contact-avatar")).not.toContainText("🤖");
    await expect(page.getByTestId("inbox-automation-pause-disabled")).toBeDisabled();
    await expect(page.locator('section:has-text("自動化")')).toContainText("自動化暫停需要先完成流程級控制與稽核設計");
    await expect(page.getByTestId("inbox-quick-hot-tag")).not.toContainText("🔥");
    await expect(page.getByTestId("inbox-quick-partner-tag")).not.toContainText("🤝");
    await page.locator('section:has-text("聯絡人標籤") select').selectOption({ label: "e2e-vip" });
    if (isMobileProject) {
      await page.getByTestId("inbox-pane-detail").click();
      await expect(page.getByTestId("inbox-composer-textarea")).toBeVisible();
    }
    const assigneeSelect = page.getByTestId("inbox-assignee-select");
    const currentAssignee = await assigneeSelect.inputValue();
    const adminOption = assigneeSelect.locator("option").filter({ hasText: adminName }).first();
    await expect(adminOption).toHaveCount(1);
    if (currentAssignee.trim()) {
      await assigneeSelect.selectOption("");
      await expect(assigneeSelect).toHaveValue("");
      await expect(page.getByTestId("inbox-notice")).toContainText("已清除對話指派");
    }

    await page.getByTestId("inbox-reminder-toggle").click();
    await expect(page.getByTestId("inbox-reminder-menu")).toBeVisible();
    await page.getByTestId("inbox-reminder-option-60").click();
    await expect(page.getByTestId("inbox-reminder-menu")).toBeHidden();
    await expect(page.getByTestId("inbox-notice")).toContainText("已設定 1 小時 提醒");

    await page.getByTestId("inbox-reminder-toggle").click();
    await page.getByTestId("inbox-reminder-custom-disabled").click();
    await expect(page.getByTestId("inbox-reminder-menu")).toBeHidden();
    await expect(page.getByTestId("inbox-notice")).toContainText("自訂日期與時間提醒目前尚未完成");

    await page.getByTestId("inbox-reminder-toggle").click();
    await page.getByTestId("inbox-reminder-clear").click();
    await expect(page.getByTestId("inbox-reminder-menu")).toBeHidden();
    await expect(page.getByTestId("inbox-notice")).toContainText("已清除提醒");

    if (isMobileProject) {
      await page.getByTestId("inbox-back-to-list").click();
    }

    if (isMobileProject) {
      await page.getByTestId("inbox-mobile-filter-button").click();
    } else {
      await page.getByRole("button", { name: "篩選", exact: true }).click();
    }
    await page.getByTestId("inbox-filter-tag").selectOption({ label: "e2e-vip" });
    await expect(page.locator("body")).not.toContainText("E2E Inbox 未讀篩選對話");
    const teamFilter = page.getByTestId("inbox-filter-team");
    await teamFilter.selectOption({ label: adminName });
    await expect(teamFilter).not.toHaveValue("all");
    if ((await page.getByTestId("inbox-empty-reset-filters").count()) > 0) {
      await expect(page.locator("body")).toContainText("目前沒有符合條件的對話");
    } else {
      await expect(page.locator("body")).toContainText(/E2E 測試聯絡人 [AB]/);
    }
    await searchInput.fill("完全不存在的 Inbox 搜尋字串");
    await expect(page.locator("body")).toContainText("目前沒有符合條件的對話");
    await page.getByTestId("inbox-empty-reset-filters").click();
    await expect(page.locator("body")).toContainText("E2E 測試聯絡人 A");
    await page.getByTestId("inbox-filter-tag").selectOption("all");
    await page.getByTestId("inbox-filter-team").selectOption("all");
    await page.getByTestId("inbox-close-filter-panel").click();

    if (isMobileProject) {
      const mainConversationRow = page.getByTestId("inbox-conversation-row").filter({ hasText: "E2E 測試聯絡人 A" }).first();
      await expect(mainConversationRow).toBeVisible();
      await mainConversationRow.click();
      await page.getByTestId("inbox-pane-contact").click();
      await expect(page.getByRole("heading", { name: "自動化" })).toBeVisible();
      await page.getByTestId("inbox-pane-detail").click();
      await expect(page.getByTestId("inbox-composer-textarea")).toBeVisible();
      await page.getByTestId("inbox-back-to-list").click();
      const mainConversationRowAgain = page.getByTestId("inbox-conversation-row").filter({ hasText: "E2E 測試聯絡人 A" }).first();
      await expect(mainConversationRowAgain).toBeVisible();
      await mainConversationRowAgain.click();
    }

    if (!isMobileProject) {
      await page.getByTestId("inbox-contact-actions-button").click();
      await expect(page.getByTestId("inbox-contact-actions-menu")).toBeVisible();
      await expect(page.getByTestId("inbox-contact-actions-menu")).toContainText("開啟聯絡人詳情");
      await expect(page.getByTestId("inbox-contact-export-disabled")).toBeDisabled();
      await expect(page.getByTestId("inbox-contact-actions-menu")).toContainText("匯出目前先停用");
      await expect(page.getByTestId("inbox-contact-block-disabled")).toBeDisabled();
      await expect(page.getByTestId("inbox-contact-actions-menu")).toContainText("封鎖 / 解除訂閱目前先停用");
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

    await expect(page.getByTestId("inbox-video-call-button")).toBeDisabled();
    await expect(page.getByTestId("inbox-more-actions-button")).toBeDisabled();
    await expect(page.getByTestId("inbox-header-disabled-hint")).toContainText("視訊通話與更多對話操作目前先停用");
    await expect(page.getByTestId("inbox-header-disabled-hint")).toContainText("文字回覆、內部備註、指派、標籤與提醒");

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
