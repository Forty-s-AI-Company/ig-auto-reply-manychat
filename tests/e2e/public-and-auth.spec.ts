import { expect, test, type Page, type TestInfo } from "@playwright/test";
import dotenv from "dotenv";
import { getAuthenticatedRouteSmokeGuard } from "./authenticated-route-smoke-guard";

dotenv.config({ path: ".env", quiet: true });
dotenv.config({ path: ".env.local", override: true, quiet: true });

type AuthenticatedRouteSmoke = {
  path: string;
  heading: RegExp;
  bodyText: RegExp;
  finalUrl?: RegExp;
};

const authenticatedRouteSmokes: AuthenticatedRouteSmoke[] = [
  { path: "/dashboard", heading: /首頁|儀表板/, bodyText: /營運總覽|查看收件匣|快速建立自動化/ },
  { path: "/inbox", heading: /收件匣/, bodyText: /收件匣|對話|訊息/ },
  { path: "/contacts", heading: /聯絡人/, bodyText: /全部聯絡人|目前沒有符合條件的聯絡人|搜尋姓名/ },
  { path: "/channels", heading: /社群平台/, bodyText: /新增平台帳號|Instagram|TikTok|WhatsApp|未開放/ },
  {
    path: "/channels/connect/instagram",
    finalUrl: /\/channels\/connect\/social(?:[?#].*)?$/,
    heading: /連接社群帳號/,
    bodyText: /Instagram OAuth|已連接帳號|還沒有任何社群登入連接/,
  },
  { path: "/analytics", heading: /分析/, bodyText: /訊息、受眾與廣播表現|資料範圍|聯絡人|總訊息/ },
  { path: "/automations", heading: /自動化/, bodyText: /自動化|流程|資料夾|新增/ },
  { path: "/sequences", heading: /序列/, bodyText: /序列列表|建立序列|訂閱聯絡人/ },
  { path: "/referrals", heading: /推薦活動/, bodyText: /你的推薦碼|推薦紀錄|推薦/ },
  { path: "/billing", heading: /方案與用量/, bodyText: /目前方案|PayUNI|發票紀錄|受控開通|測試站/ },
];

function routeUrlPattern(path: string) {
  const escapedPath = path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`${escapedPath}(?:[?#].*)?$`);
}

async function expectNoHorizontalOverflow(page: Page) {
  await page.waitForTimeout(150);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
}

async function expectPublicLandingPage(page: Page) {
  await expect(page).toHaveURL(/\/official(?:[?#].*)?$/);
  await expect(page).toHaveTitle(/InboxPilot/);
  await expect(page.getByRole("heading", { name: /社群訊息，自動處理|InboxPilot/ }).first()).toBeVisible();
  await expect(page.locator("body")).toContainText(/InboxPilot/);
}

async function expectAuthenticatedRoute(page: Page, route: AuthenticatedRouteSmoke) {
  await page.goto(route.path, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(route.finalUrl || routeUrlPattern(route.path));
  await expect(page.getByRole("heading", { name: route.heading }).first()).toBeVisible();
  await expect(page.locator("body")).toContainText(route.bodyText);
}

async function loginForAuthenticatedSmoke(page: Page, testInfo: TestInfo, email: string, password: string) {
  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await page.request.post("/api/auth/login", {
        data: { email, password },
        headers: {
          origin: "http://127.0.0.1:3041",
          "x-forwarded-for": `e2e-${testInfo.project.name}-${testInfo.workerIndex}-${testInfo.retry}-${testInfo.testId}-${attempt}`,
        },
      });

      if (response.ok()) return;
      lastError = new Error(`Login returned HTTP ${response.status()}`);
    } catch (error) {
      lastError = error;
    }

    await page.waitForTimeout(250 * attempt);
  }

  throw lastError instanceof Error ? lastError : new Error("Login request failed.");
}

test.describe("public and protected navigation", () => {
  test("renders the public landing page and reaches login", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expectPublicLandingPage(page);

    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /登入|Login/ })).toBeVisible();
    await expect(page.getByLabel(/Email|電子郵件/)).toBeVisible();
    await expect(page.getByLabel(/Password|密碼/)).toBeVisible();
  });

  test("renders help center with an actionable Instagram connection path", async ({ page }) => {
    await page.goto("/help-center", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "從連接 IG 到建立自動化，一步一步完成。" })).toBeVisible();
    await expect(page.getByRole("link", { name: "開始連接 Instagram" })).toHaveAttribute("href", "/channels/connect");
    await expect(page.locator("body")).toContainText("確認左側帳號切換器");
    await expect(page.locator("body")).not.toContainText("這裡放");
  });

  test("preserves selected plan context from pricing into signup", async ({ page }) => {
    await page.goto("/pricing", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText("方案與價格");
    await expect(page.getByRole("heading", { name: /依照 IG 訊息營運規模選擇方案/ })).toBeVisible();
    await expect(page.getByTestId("pricing-referral-credit-rules")).toBeVisible();

    await page.locator('a[href="/signup?plan=pro"]').click();
    await expect(page).toHaveURL(/\/signup\?plan=pro(?:[&#].*)?$/);
    await expect(page.getByTestId("signup-selected-plan")).toContainText("Pro");
    await expect(page.getByTestId("signup-selected-plan")).toContainText("PayUNI Sandbox");
    await expect(page.getByTestId("signup-back-to-pricing")).toHaveAttribute("href", "/pricing");
  });

  test("keeps protected dashboard behind authentication", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: /登入|Login/ })).toBeVisible();
  });

  test("mobile public page does not overflow horizontally", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expectPublicLandingPage(page);
    await page.waitForLoadState("networkidle").catch(() => {});

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
  });
});

test.describe("authenticated route smoke", () => {
  test.setTimeout(60_000);
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const guard = getAuthenticatedRouteSmokeGuard();

  test.skip(!adminEmail || !adminPassword, "ADMIN_EMAIL and ADMIN_PASSWORD are required for authenticated smoke tests.");
  test.skip(guard.shouldSkip, guard.reason);

  test.beforeEach(async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginForAuthenticatedSmoke(page, testInfo, adminEmail, adminPassword);
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("renders authenticated launch routes on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });

    for (const route of authenticatedRouteSmokes) {
      await expectAuthenticatedRoute(page, route);
    }
  });

  test("renders authenticated launch routes on mobile without horizontal overflow", async ({ page }) => {
    for (const route of authenticatedRouteSmokes) {
      await expectAuthenticatedRoute(page, route);
      await expectNoHorizontalOverflow(page);
    }
  });

  test("shows Automations scope clarity and disabled controls", async ({ page }) => {
    await page.goto("/automations", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("automation-scope-notice")).toBeVisible();
    await expect(page.getByTestId("automation-scope-notice")).toContainText("工作區共用");
    await expect(page.locator("body")).toContainText("切換 IG 帳號只會影響看板與對話篩選");
    await page.getByTestId("automation-trigger-filter").selectOption("manual");
    await expect(page.getByTestId("automation-trigger-filter")).toHaveValue("manual");
    if ((await page.getByTestId("automation-list-empty").count()) > 0) {
      await expect(page.getByTestId("automation-list-empty")).toContainText(/目前沒有符合篩選條件的自動化|尚未建立自動化/);
    } else {
      await expect(page.getByTestId("automation-item-manual").first()).toBeVisible();
    }
    await page.getByTestId("automation-trigger-filter").selectOption("all");
    await expect(page.getByRole("button", { name: "回收桶" })).toBeDisabled();
    await expect(page.getByTestId("automation-trash-disabled")).toHaveAttribute("aria-describedby", "automation-trash-disabled-reason");
    await expect(page.getByTestId("automation-trash-disabled")).toHaveAttribute("title", /受控開通/);
    await expect(page.getByTestId("automation-trash-disabled")).not.toHaveAttribute("title", /沒接好/);
    await expect(page.locator("#automation-trash-disabled-reason")).toContainText("還原、永久刪除與稽核紀錄");
    await page.getByTestId("automation-tab-basic").click();
    await expect(page.getByTestId("automation-basic-disabled-new-follower")).toBeDisabled();
    await expect(page.getByTestId("automation-basic-disabled-opening-prompts")).toBeDisabled();
    await expect(page.getByTestId("automation-basic-disabled-story-mentions")).toBeDisabled();
    await expect(page.getByTestId("automation-basic-disabled-main-menu")).toBeDisabled();
    await expect(page.getByTestId("automation-basic-disabled-opening-prompts")).toHaveAttribute("aria-describedby", "automation-basic-disabled-opening-prompts-reason");
    await expect(page.getByTestId("automation-basic-disabled-story-mentions")).toHaveAttribute("aria-describedby", "automation-basic-disabled-story-mentions-reason");
    await expect(page.getByTestId("automation-basic-disabled-main-menu")).toHaveAttribute("aria-describedby", "automation-basic-disabled-main-menu-reason");
    await expect(page.getByTestId("automation-basic-disabled-opening-prompts")).toContainText("受控開通");
    await expect(page.getByTestId("automation-basic-disabled-story-mentions")).toContainText("受控開通");
    await expect(page.getByTestId("automation-basic-disabled-main-menu")).toContainText("受控開通");

    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/automations", { waitUntil: "domcontentloaded" });
    await page.getByTestId("automation-header-create-cta").click();
    await expect(page.getByTestId("automation-template-dialog")).toBeVisible();
    await page.getByTestId("automation-template-blank-start").click();
    await expect(page.getByTestId("automation-canvas-editor-hint")).toBeVisible();
    await expect(page.getByTestId("automation-canvas-editor-hint")).toContainText("點選節點即可編輯");
    await expect(page.getByLabel("返回自動化列表")).toBeVisible();
    await expect(page.getByLabel("展開節點編輯面板")).toHaveCount(0);
    await expect(page.getByTestId("automation-editor-more-disabled")).toBeDisabled();
    await expect(page.getByTestId("automation-editor-more-disabled")).toHaveAttribute("aria-label", "更多操作受控開通");
    await expect(page.getByTestId("automation-editor-more-disabled")).toHaveAttribute("aria-describedby", "automation-editor-more-disabled-reason");
    await expect(page.getByTestId("automation-editor-more-disabled")).toHaveAttribute("title", /受控開通/);
    await expect(page.getByTestId("automation-editor-more-disabled")).not.toHaveAttribute("title", /沒有接好/);
    await expect(page.locator("#automation-editor-more-disabled-reason")).toContainText("複製、封存與匯出");
    await expect(page.getByPlaceholder("搜尋其他自動化…")).toBeVisible();
  });

  test("shows analytics scope and data-state guidance", async ({ page }) => {
    await page.goto("/analytics", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("analytics-state-banner")).toBeVisible();
    await expect(page.locator("body")).toContainText("資料範圍");
    await expect(page.locator("body")).toContainText(/目前看整個工作區的資料|目前只看「.+」的資料/);
    await expect(page.locator("body")).toContainText(/尚未有發送紀錄|成功 \d+ \/ 失敗 \d+/);
    await expect(page.locator("body")).toContainText(/尚未建立流程|啟用 \d+ \/ 全部 \d+/);
  });

  test("shows Sequences disabled states instead of broken submit controls", async ({ page }) => {
    await page.goto("/sequences", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "序列", exact: true })).toBeVisible();

    const sequenceNameInput = page.getByTestId("sequence-name-input");
    await expect(sequenceNameInput).toHaveValue("新名單培養序列");
    await sequenceNameInput.fill("");
    await expect(sequenceNameInput).toHaveValue("");
    await expect(page.getByTestId("sequence-save-button")).toBeDisabled();
    await expect(page.getByTestId("sequence-save-button")).toHaveAttribute("title", "請先填寫序列名稱。");
    await expect(page.locator("body")).toContainText("請先填寫序列名稱。");

    await page.getByTestId("sequence-subscribe-sequence-select").selectOption("");
    await expect(page.getByTestId("sequence-subscribe-button")).toBeDisabled();
    await expect(page.getByTestId("sequence-subscribe-button")).toHaveAttribute("title", "請先選擇要訂閱的序列。");
    await expect(page.locator("body")).toContainText("請先選擇要訂閱的序列。");
  });

  test("uses a confirmation dialog before removing sequence draft steps", async ({ page }) => {
    await page.goto("/sequences", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "序列", exact: true })).toBeVisible();

    await page.getByRole("button", { name: "新增步驟" }).click();
    await expect(page.getByText("第 2 封", { exact: true })).toBeVisible();

    await page.getByTestId("sequence-step-remove-1").click();
    await expect(page.getByRole("dialog", { name: "移除序列步驟？" })).toBeVisible();
    await expect(page.getByTestId("sequence-step-remove-dialog")).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.getByRole("button", { name: "取消" }).click();
    await expect(page.getByRole("dialog", { name: "移除序列步驟？" })).toHaveCount(0);
    await expect(page.getByText("第 2 封", { exact: true })).toBeVisible();

    await page.getByTestId("sequence-step-remove-1").click();
    await page.getByTestId("sequence-step-confirm-remove").click();
    await expect(page.getByRole("dialog", { name: "移除序列步驟？" })).toHaveCount(0);
    await expect(page.getByText("已從草稿移除第 2 封")).toBeVisible();
    await expect(page.getByTestId("sequence-step-remove-1")).toHaveCount(0);
  });

  test("keeps Segments create and delete actions explicit", async ({ page }, testInfo) => {
    const segmentName = `Playwright 分群確認 ${testInfo.project.name} ${Date.now()}`;

    await page.goto("/segments", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "受眾分群" })).toBeVisible();

    await expect(page.getByTestId("segments-save-button")).toBeEnabled();
    await page.locator('input[name="segment-name"]').fill("");
    await expect(page.getByTestId("segments-save-button")).toBeDisabled();
    await expect(page.getByTestId("segments-save-button")).toHaveAttribute("title", "請先輸入分群名稱。");
    await expect(page.locator("body")).toContainText("請先輸入分群名稱，才能儲存這組篩選條件。");

    await page.locator('input[name="segment-name"]').fill(segmentName);
    await page.getByTestId("segments-save-button").click();
    await expect(page.locator("body")).toContainText(segmentName);

    const segmentCard = page.locator("article").filter({ hasText: segmentName }).first();
    await segmentCard.getByRole("button", { name: "刪除" }).click();
    await expect(page.getByRole("dialog", { name: "刪除分眾名單？" })).toBeVisible();
    await expect(page.getByTestId("segments-delete-dialog")).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await expect(page.locator("body")).toContainText("刪除前請確認沒有正在排程或準備中的廣播依賴這個分眾。");
    await page.getByRole("button", { name: "取消" }).click();
    await expect(page.getByRole("dialog", { name: "刪除分眾名單？" })).toHaveCount(0);

    await segmentCard.getByRole("button", { name: "刪除" }).click();
    await page.getByTestId("segments-confirm-delete").click();
    await expect(page.getByRole("dialog", { name: "刪除分眾名單？" })).toHaveCount(0);
    await expect(segmentCard).toHaveCount(0);
  });

  test("shows Settings IA with focused social platform controls", async ({ page }) => {
    await page.goto("/channels", { waitUntil: "domcontentloaded" });
    await expect(page.locator("h1").filter({ hasText: "社群平台" })).toBeVisible();
    expect(await page.locator('a[href="/billing"]').count()).toBeGreaterThan(0);
    expect(await page.locator('a[href="/ai-settings"]').count()).toBeGreaterThan(0);
    expect(await page.locator('a[href="/channels"]').count()).toBeGreaterThan(0);
    await expect(page.locator("body")).toContainText("TikTok");
    await expect(page.locator("body")).toContainText("WhatsApp");
    await expect(page.locator("body")).toContainText("未開放");
    await expect(page.locator("body")).toContainText("目前未開放線上連線");
    await expect(page.locator("body")).not.toContainText("Mock OAuth Provider");
    await expect(page.locator("body")).not.toContainText("規劃中");
    await expect(page.locator("body")).not.toContainText("通知設定");
    await expect(page.locator("body")).not.toContainText("操作紀錄");
  });

  test("shows billing sandbox gate guidance", async ({ page }) => {
    await page.goto("/billing", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: /方案與用量/ })).toBeVisible();
    await expect(page.locator("body")).toContainText(/PayUNI 測試站|PayUNI 正式站/);
    await expect(page.locator("body")).toContainText(/受控開通|正式站尚未開通自動扣款|目前付款會先走 sandbox/);
  });

  test("shows Referrals in the shared light dashboard style", async ({ page }) => {
    await page.goto("/referrals", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("referrals-hero-card")).toBeVisible();
    await expect(page.getByTestId("referrals-url")).toContainText(/ref=|邀請|http/);
    await expect(page.getByRole("button", { name: "複製推薦連結" })).toBeVisible();
    await expect(page.getByTestId("referrals-records-card")).toBeVisible();
    await expect(page.locator("body")).toContainText(/推薦折抵制度 v1|待確認折抵|可用折抵/);
    await expect(page.locator("body")).toContainText("7 天退款觀察期");
    await expect(page.locator("body")).toContainText("單筆帳單最多折到 0 元");
    await expect(page.locator("body")).toContainText("不顯示假點擊數");
  });

  test("keeps Affiliate cash payout behind a controlled opening", async ({ page }) => {
    await page.goto("/affiliate", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "推薦折抵與受控聯盟" })).toBeVisible();
    await expect(page.locator("body")).toContainText("正式產品主線目前以推薦折抵為主");
    await expect(page.locator("body")).toContainText("目前不開放受控付款");
    await expect(page.getByRole("button", { name: "受控付款後續開放" })).toBeDisabled();
    await expect(page.locator("body")).toContainText("受控聯盟付款狀態");
    await expect(page.getByTestId("affiliate-open-referrals")).toHaveAttribute("href", "/referrals");
    await expect(page.getByTestId("affiliate-open-wallet")).toHaveAttribute("href", "/wallet");
    await expect(page.getByTestId("affiliate-open-billing")).toHaveAttribute("href", "/billing");
  });

  test("shows wallet lifecycle guidance for pending and expiring referral credits", async ({ page }) => {
    await page.goto("/wallet", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "折抵金錢包" })).toBeVisible();
    await expect(page.locator("body")).toContainText("待確認折抵金");
    await expect(page.locator("body")).toContainText("7 天");
    await expect(page.locator("body")).toContainText("30 天內未使用會自動失效");
    await expect(page.getByTestId("wallet-open-referrals")).toHaveAttribute("href", "/referrals");
    await expect(page.getByTestId("wallet-open-billing")).toHaveAttribute("href", "/billing");
  });

  test("opens and closes the mobile admin menu", async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.includes("mobile"), "Mobile admin menu smoke only applies to mobile viewport projects.");

    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    const inboxMenuLink = page.getByTestId("admin-mobile-nav-link-inbox");

    await page.getByRole("button", { name: "開啟選單" }).click();
    await expect(inboxMenuLink).toBeVisible();
    await expect(page.getByTestId("admin-mobile-nav-link-channels")).toContainText("設定");
    await expect(page.getByTestId("admin-mobile-nav-link-referrals")).toContainText("推薦活動");
    await expect(page.getByTestId("admin-mobile-nav-link-billing")).toHaveCount(0);
    await page.getByRole("button", { name: "我的個人檔案" }).click();
    await expect(page.locator("body")).toContainText("目前方案");
    await expect(page.locator("body")).toContainText("方案與用量");
    await expect(page.locator("body")).toContainText("說明中心");
    await expect(page.getByRole("link", { name: "AI 設定" })).toHaveAttribute("href", "/ai-settings");
    await expect(page.getByLabel("選擇介面語言")).toHaveValue("zh-TW");
    await expect(page.getByLabel("選擇介面語言")).toContainText("English（受控開通）");
    await expect(page.getByTestId("profile-language-help")).toContainText("英文介面會在翻譯、客服與審核文案整理完成後受控開通");
    await expect(page.locator("body")).not.toContainText("進階功能");
    await expect(page.locator("body")).not.toContainText("排隊中");
    await page.getByRole("button", { name: "關閉選單", exact: true }).click();
    await expect(inboxMenuLink).toBeHidden();
  });
});
