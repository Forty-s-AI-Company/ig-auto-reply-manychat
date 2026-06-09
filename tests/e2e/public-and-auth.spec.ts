import { expect, test } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: ".env", quiet: true });
dotenv.config({ path: ".env.local", override: true, quiet: true });

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

test.describe("authenticated mobile navigation", () => {
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const mobilePages = [
    { path: "/dashboard", heading: /首頁|儀表板/ },
    { path: "/broadcasts", heading: /廣播活動/ },
    { path: "/analytics", heading: /分析/ },
    { path: "/channels", heading: /設定|渠道|頻道|Channel/ },
    { path: "/billing", heading: /付款與用量/ },
  ];

  test.skip(!adminEmail || !adminPassword, "ADMIN_EMAIL and ADMIN_PASSWORD are required for authenticated smoke tests.");

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const response = await page.request.post("/api/auth/login", {
      data: { email: adminEmail, password: adminPassword },
      headers: { origin: "http://127.0.0.1:3041" },
    });
    expect(response.ok()).toBeTruthy();
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("renders authenticated main pages on mobile without horizontal overflow", async ({ page }) => {
    for (const mobilePage of mobilePages) {
      await page.goto(mobilePage.path, { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { name: mobilePage.heading }).first()).toBeVisible();
      await page.waitForLoadState("networkidle").catch(() => {});

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(2);
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
