import { expect, test } from "@playwright/test";
import dotenv from "dotenv";
import { getAuthenticatedRouteSmokeGuard } from "./authenticated-route-smoke-guard";

dotenv.config({ path: ".env", quiet: true });
dotenv.config({ path: ".env.local", override: true, quiet: true });

const loginRunId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

test.describe("contacts authenticated smoke", () => {
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
        "x-forwarded-for": `contacts-e2e-${loginRunId}-${testInfo.project.name}-${testInfo.workerIndex}-${testInfo.retry}-${testInfo.testId}`,
      },
    });
    expect(response.ok(), `login failed with ${response.status()}: ${await response.text()}`).toBeTruthy();
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  async function selectContactRow(page: import("@playwright/test").Page, contactName: string) {
    const row = page.locator("tr", { hasText: contactName });
    const checkbox = row.locator("input[type='checkbox']");
    await expect(row).toBeAttached();
    await checkbox.click({ force: true });
    await expect(checkbox).toBeChecked();
    return row;
  }

  test("filters contacts and batch adds a tag to selected contacts", async ({ page }) => {
    const isMobileProject = test.info().project.name.includes("mobile");
    const batchContactName = isMobileProject ? "E2E 批次聯絡人 Mobile" : "E2E 批次聯絡人 Desktop";

    await page.goto("/contacts", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("contacts-list-client")).toHaveAttribute("data-ready", "true");
    await expect(page.locator("body")).toContainText(batchContactName);
    await expect(page.locator("body")).toContainText("E2E 測試聯絡人 B");

    await page.getByTestId("contacts-filter-button").click();
    await page.getByTestId("contacts-filter-status").selectOption("unknown");
    await page.getByRole("button", { name: "套用篩選" }).click();
    await expect(page).toHaveURL(/\/contacts\?status=unknown/);
    await expect(page.locator("body")).toContainText("E2E 測試聯絡人 B");
    await expect(page.locator("body")).not.toContainText("E2E 測試聯絡人 A");
    await expect(page.locator("body")).not.toContainText(batchContactName);

    await page.goto("/contacts", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("contacts-list-client")).toHaveAttribute("data-ready", "true");
    await selectContactRow(page, batchContactName);
    await expect(page.locator("body")).toContainText("已選取 1 位聯絡人");
    await page.getByLabel("選擇批次加入的標籤").selectOption({ label: "e2e-vip" });
    await page.getByTestId("contacts-batch-add-tag").click();
    await expect(page.locator("body")).toContainText(/已為 \d+ 位聯絡人加入標籤/);

    await page.getByTestId("contacts-filter-button").click();
    await page.getByTestId("contacts-filter-tag").selectOption({ label: "e2e-vip" });
    await page.getByRole("button", { name: "套用篩選" }).click();
    await expect(page).toHaveURL(/\/contacts\?tag=/);
    await expect(page.locator("body")).toContainText(batchContactName);
    await expect(page.locator("body")).toContainText("e2e-vip");

    await selectContactRow(page, batchContactName);
    await page.getByLabel("選擇批次加入的標籤").selectOption({ label: "e2e-vip" });
    await page.getByTestId("contacts-batch-remove-tag").click();
    await expect(page.locator("body")).toContainText(/已從 \d+ 位聯絡人移除標籤/);
  });

  test("creates a segment from the current contacts filter", async ({ page }) => {
    await page.goto("/contacts?status=opted_in", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText("E2E 測試聯絡人 A");

    await page.getByTestId("contacts-create-segment-button").click();
    await page.getByTestId("contacts-segment-name").fill(`E2E 篩選分眾 ${Date.now()}`);
    await page.getByTestId("contacts-segment-description").fill("Playwright 從 Contacts 篩選建立");
    await page.getByTestId("contacts-confirm-create-segment").click();
    await expect(page.locator("body")).toContainText("已建立分眾");
  });

  test("edits contact detail fields, cancels edits, saves, and manages tags", async ({ page }, testInfo) => {
    const isMobileProject = testInfo.project.name.includes("mobile");
    const detailContactId = isMobileProject ? "e2e-contact-detail-mobile" : "e2e-contact-detail-chromium";
    const detailContactName = isMobileProject ? "E2E 詳情頁聯絡人 Mobile" : "E2E 詳情頁聯絡人 Desktop";

    await page.goto(`/contacts/${detailContactId}`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: detailContactName })).toBeVisible();

    const username = page.getByTestId("contact-detail-username");
    const email = page.getByTestId("contact-detail-email");
    const phone = page.getByTestId("contact-detail-phone");

    await username.fill("cancelled_username");
    await email.fill("cancelled@example.com");
    await phone.fill("0911111111");
    await page.getByRole("button", { name: "取消" }).click();
    await expect(username).toHaveValue("detail_before");
    await expect(email).toHaveValue("detail-before@example.com");
    await expect(phone).toHaveValue("0900000000");

    await username.fill("detail_after");
    await email.fill("detail-after@example.com");
    await phone.fill("0922222222");
    await page.getByRole("button", { name: "儲存變更" }).click();
    await expect(page.getByRole("status")).toContainText("聯絡人資料已更新");

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(username).toHaveValue("detail_after");
    await expect(email).toHaveValue("detail-after@example.com");
    await expect(phone).toHaveValue("0922222222");

    await page.getByTestId("contact-detail-tag-select").selectOption({ label: "e2e-detail-tag" });
    await page.getByTestId("contact-detail-add-tag").click();
    await expect(page.getByRole("status")).toContainText("標籤已新增到聯絡人");
    await expect(page.locator("body")).toContainText("e2e-detail-tag");

    await page.getByTestId("contact-detail-remove-tag-e2e-detail-tag").click();
    await expect(page.getByRole("status")).toContainText("標籤已從聯絡人移除");
    await expect(page.getByTestId("contact-detail-tag-select")).toContainText("e2e-detail-tag");
  });
});
