import { expect, test, type Page } from "@playwright/test";
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
  await page.waitForLoadState("networkidle").catch(() => {});
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
}

async function expectAuthenticatedRoute(page: Page, route: AuthenticatedRouteSmoke) {
  await page.goto(route.path, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(route.finalUrl || routeUrlPattern(route.path));
  await expect(page.getByRole("heading", { name: route.heading }).first()).toBeVisible();
  await expect(page.locator("body")).toContainText(route.bodyText);
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
    const response = await page.request.post("/api/auth/login", {
      data: { email: adminEmail, password: adminPassword },
      headers: {
        origin: "http://127.0.0.1:3041",
        "x-forwarded-for": `e2e-${testInfo.project.name}-${testInfo.workerIndex}-${testInfo.retry}-${testInfo.testId}`,
      },
    });
    expect(response.ok()).toBeTruthy();
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

  test("opens and closes the mobile admin menu", async ({ page }) => {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "開啟選單" }).click();
    await expect(page.getByRole("link", { name: "廣播活動" })).toBeVisible();
    await page.getByRole("button", { name: "關閉選單", exact: true }).click();
    await expect(page.getByRole("link", { name: "廣播活動" })).toBeHidden();
  });
});
