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
  { path: "/channels", heading: /工作區、Instagram 與自動化設定|設定/, bodyText: /新增平台帳號|Instagram|工作區、Instagram 與自動化設定/ },
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
    await page.goto("/");
    await expect(page).toHaveTitle(/InboxPilot/);
    await expect(page.locator("body")).toContainText(/InboxPilot/);

    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /登入|Login/ })).toBeVisible();
    await expect(page.getByLabel(/Email|電子郵件/)).toBeVisible();
    await expect(page.getByLabel(/Password|密碼/)).toBeVisible();
  });

  test("keeps protected dashboard behind authentication", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: /登入|Login/ })).toBeVisible();
  });

  test("mobile public page does not overflow horizontally", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText("InboxPilot");
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
    await expect(page.getByTestId("automation-trash-disabled")).toHaveAttribute("title", /受控開通/);
    await expect(page.getByTestId("automation-trash-disabled")).not.toHaveAttribute("title", /沒接好/);
    await page.getByTestId("automation-tab-basic").click();
    await expect(page.getByTestId("automation-basic-disabled-new-follower")).toBeDisabled();
    await expect(page.getByTestId("automation-basic-disabled-opening-prompts")).toBeDisabled();
    await expect(page.getByTestId("automation-basic-disabled-story-mentions")).toBeDisabled();
    await expect(page.getByTestId("automation-basic-disabled-main-menu")).toBeDisabled();
    await expect(page.getByTestId("automation-basic-disabled-opening-prompts")).toContainText("受控開通");
    await expect(page.getByTestId("automation-basic-disabled-story-mentions")).toContainText("受控開通");
    await expect(page.getByTestId("automation-basic-disabled-main-menu")).toContainText("受控開通");

    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/automations", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "新增自動化" }).click();
    await page.getByRole("button", { name: "從空白開始" }).click();
    await expect(page.getByTestId("automation-canvas-editor-hint")).toBeVisible();
    await expect(page.getByTestId("automation-canvas-editor-hint")).toContainText("點選節點即可編輯");
    await expect(page.getByLabel("返回自動化列表")).toBeVisible();
    await expect(page.getByLabel("展開節點編輯面板")).toHaveCount(0);
    await expect(page.getByTestId("automation-editor-more-disabled")).toBeDisabled();
    await expect(page.getByTestId("automation-editor-more-disabled")).toHaveAttribute("aria-label", "更多操作受控開通");
    await expect(page.getByTestId("automation-editor-more-disabled")).toHaveAttribute("title", /受控開通/);
    await expect(page.getByTestId("automation-editor-more-disabled")).not.toHaveAttribute("title", /沒有接好/);
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
    const sequenceSaveButton = page.getByTestId("sequence-save-button");
    await expect(sequenceSaveButton).toBeDisabled();
    await expect(sequenceSaveButton).toHaveAttribute("title", "請先填寫序列名稱。");
    await expect(page.locator("body")).toContainText("請先填寫序列名稱。");

    await page.getByTestId("sequence-subscribe-sequence-select").selectOption("");
    await expect(page.getByTestId("sequence-subscribe-button")).toBeDisabled();
    await expect(page.getByTestId("sequence-subscribe-button")).toHaveAttribute("title", "請先選擇要訂閱的序列。");
    await expect(page.locator("body")).toContainText("請先選擇要訂閱的序列。");
  });

  test("shows Channels planned settings as explicit disabled controls", async ({ page }) => {
    await page.goto("/channels", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("channels-notifications-disabled")).toBeDisabled();
    await expect(page.getByTestId("channels-notifications-disabled")).toContainText("Email 通知受控開通");
    await expect(page.getByTestId("channels-display-disabled")).toBeDisabled();
    await expect(page.getByTestId("channels-display-disabled")).toContainText("主題與語言受控開通");
    await expect(page.getByTestId("channels-logs-disabled")).toBeDisabled();
    await expect(page.getByTestId("channels-logs-disabled")).toContainText("稽核紀錄受控開通");
    await expect(page.locator("body")).toContainText("AI 設定");
    await expect(page.locator("body")).toContainText(/前往 AI 設定|完整版測試站可設定/);
    await expect(page.getByTestId("channels-sequence-settings-disabled")).toBeDisabled();
    await expect(page.getByTestId("channels-sequence-settings-disabled")).toContainText("序列設定受控開通");
    await expect(page.getByTestId("channels-conversion-events-disabled")).toBeDisabled();
    await expect(page.getByTestId("channels-conversion-events-disabled")).toContainText("轉換事件受控開通");
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
    await expect(page.getByTestId("referrals-records-card")).toBeVisible();
    await expect(page.locator("body")).toContainText(/目前推薦活動只記錄邀請連結|有效推薦會讓雙方/);
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
    await expect(page.getByRole("link", { name: "AI 設定" })).toHaveAttribute("href", "/channels#ai-settings");
    await expect(page.getByLabel("選擇介面語言")).toHaveValue("zh-TW");
    await expect(page.getByLabel("選擇介面語言")).toContainText("English（受控開通）");
    await expect(page.getByTestId("profile-language-help")).toContainText("英文介面會在翻譯、客服與審核文案整理完成後受控開通");
    await expect(page.locator("body")).not.toContainText("進階功能");
    await expect(page.locator("body")).not.toContainText("排隊中");
    await page.getByRole("button", { name: "關閉選單", exact: true }).click();
    await expect(inboxMenuLink).toBeHidden();
  });
});
