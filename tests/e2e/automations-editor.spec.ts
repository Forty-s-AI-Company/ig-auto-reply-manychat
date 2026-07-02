import { expect, test, type Page, type TestInfo } from "@playwright/test";
import dotenv from "dotenv";
import { getAuthenticatedRouteSmokeGuard } from "./authenticated-route-smoke-guard";

dotenv.config({ path: ".env", quiet: true });
dotenv.config({ path: ".env.local", override: true, quiet: true });

const loginRunId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

async function login(page: Page, testInfo: TestInfo, email: string, password: string) {
  const response = await page.request.post("/api/auth/login", {
    data: { email, password },
    headers: {
      origin: "http://127.0.0.1:3041",
      "x-forwarded-for": `automations-editor-smoke-${loginRunId}-${testInfo.project.name}-${testInfo.workerIndex}-${testInfo.retry}-${testInfo.testId}`,
    },
  });

  expect(response.ok(), `login failed with ${response.status()}: ${await response.text()}`).toBeTruthy();
}

async function expectNoHorizontalOverflow(page: Page) {
  await page.waitForTimeout(150);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);
}

test.describe("automations editor polish", () => {
  test.setTimeout(45_000);

  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const guard = getAuthenticatedRouteSmokeGuard();

  test.skip(!adminEmail || !adminPassword, "ADMIN_EMAIL and ADMIN_PASSWORD are required for automations editor smoke.");
  test.skip(guard.shouldSkip, guard.reason);

  test("loads the React Flow editor without style warnings", async ({ page }, testInfo) => {
    const consoleWarnings: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "warning") {
        consoleWarnings.push(message.text());
      }
    });

    await page.setViewportSize({ width: 1366, height: 768 });
    await login(page, testInfo, adminEmail, adminPassword);
    await page.goto("/automations", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "新增自動化" }).click();
    await page.getByRole("button", { name: "從空白開始" }).click();

    const canvas = page.getByTestId("automation-flow-canvas");
    await expect(canvas).toBeVisible();
    await expect(page.getByTestId("automation-canvas-editor-hint")).toBeVisible();
    await expect(page.getByTestId("flow-auto-arrange")).toBeVisible();

    const paneZIndex = await page.locator(".react-flow__pane").evaluate((element) => window.getComputedStyle(element).zIndex);
    expect(paneZIndex).toBe("1");

    const box = await canvas.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(320);
    expect(box?.height ?? 0).toBeGreaterThan(420);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);

    const styleWarnings = consoleWarnings.filter((warning) => warning.includes("haven't loaded the styles"));
    expect(styleWarnings).toEqual([]);
  });

  test("confirms destructive node deletion before changing the draft", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await login(page, testInfo, adminEmail, adminPassword);
    await page.goto("/automations", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "新增自動化" }).click();
    await page.getByRole("button", { name: "從空白開始" }).click();

    await page.getByTestId("flow-add-node").click();
    await page.getByRole("button", { name: /傳送訊息/ }).click();
    await expect(page.getByRole("button", { name: "刪除節點" })).toBeVisible();

    await page.getByRole("button", { name: "刪除節點" }).click();
    await expect(page.getByRole("dialog", { name: "刪除流程節點？" })).toBeVisible();

    await page.getByRole("button", { name: "取消" }).click();
    await expect(page.getByRole("dialog", { name: "刪除流程節點？" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "刪除節點" })).toBeVisible();

    await page.getByRole("button", { name: "刪除節點" }).click();
    await page.getByTestId("automation-node-confirm-delete").click();
    await expect(page.getByRole("dialog", { name: "刪除流程節點？" })).toHaveCount(0);
    await expect(page.getByText("觸發條件")).toBeVisible();
  });

  test("shows a clear mobile canvas limitation notice", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await login(page, testInfo, adminEmail, adminPassword);
    await page.goto("/automations", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "新增自動化" }).click();
    await page.getByRole("button", { name: "從空白開始" }).click();

    await expect(page.getByTestId("automation-mobile-canvas-notice")).toBeVisible();
    await expect(page.getByTestId("automation-mobile-canvas-notice")).toContainText("流程畫布建議使用桌機或平板編輯");
    await expect(page.getByTestId("automation-flow-canvas")).toBeHidden();
  });

  test("keeps mobile automation dialogs scroll-safe", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await login(page, testInfo, adminEmail, adminPassword);
    await page.goto("/automations", { waitUntil: "domcontentloaded" });

    await page.getByRole("button", { name: "新增資料夾" }).click();
    await expect(page.getByTestId("automation-folder-dialog")).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.getByRole("button", { name: "取消" }).click();
    await expect(page.getByTestId("automation-folder-dialog")).toHaveCount(0);

    await page.getByRole("button", { name: "新增自動化" }).click();
    await expect(page.getByTestId("automation-template-dialog")).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.getByLabel("關閉模板選擇").click();
    await expect(page.getByTestId("automation-template-dialog")).toHaveCount(0);
  });
});
