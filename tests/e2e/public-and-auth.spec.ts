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
  { path: "/channels", heading: /帳號、渠道與自動化設定|設定/, bodyText: /新增平台帳號|Instagram|帳號、渠道與自動化設定/ },
  {
    path: "/channels/connect/instagram",
    finalUrl: /\/channels\/connect\/social(?:[?#].*)?$/,
    heading: /連接 Social Accounts/,
    bodyText: /Instagram OAuth|已連接帳號|還沒有任何 Social Login 連接/,
  },
  { path: "/analytics", heading: /分析/, bodyText: /訊息、受眾與廣播表現|聯絡人|總訊息/ },
  { path: "/automations", heading: /自動化/, bodyText: /自動化|流程|資料夾|新增/ },
  { path: "/referrals", heading: /推薦活動/, bodyText: /你的推薦碼|推薦紀錄|推薦/ },
  { path: "/billing", heading: /付款與用量/, bodyText: /目前方案|PayUNI|發票紀錄/ },
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
    await expect(page.getByRole("button", { name: "回收桶" })).toBeDisabled();
    await page.getByRole("button", { name: "基礎流程" }).click();
    await expect(page.getByTestId("automation-basic-disabled-new-follower")).toBeDisabled();
    await expect(page.getByTestId("automation-basic-disabled-opening-prompts")).toBeDisabled();
    await expect(page.getByTestId("automation-basic-disabled-story-mentions")).toBeDisabled();
    await expect(page.getByTestId("automation-basic-disabled-main-menu")).toBeDisabled();
  });

  test("opens and closes the mobile admin menu", async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.includes("mobile"), "Mobile admin menu smoke only applies to mobile viewport projects.");

    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    const inboxMenuLink = page.getByTestId("admin-mobile-nav-link-inbox");

    await page.getByRole("button", { name: "開啟選單" }).click();
    await expect(inboxMenuLink).toBeVisible();
    await page.getByRole("button", { name: "關閉選單", exact: true }).click();
    await expect(inboxMenuLink).toBeHidden();
  });
});
