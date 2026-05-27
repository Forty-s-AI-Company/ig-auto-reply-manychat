import { beforeEach, describe, expect, it } from "vitest";
import { billingAddons, getPlan } from "@/lib/billing";
import { assertWorkspaceLimit, getWorkspaceEntitlement } from "@/lib/billing/entitlements";
import { getDb } from "@/lib/db";

const db = getDb();

async function cleanDb() {
  await db.messageEventLedger.deleteMany();
  await db.usagePeriod.deleteMany();
  await db.subscriptionAddon.deleteMany();
  await db.paymentOrder.deleteMany();
  await db.invoiceItem.deleteMany();
  await db.invoice.deleteMany();
  await db.subscription.deleteMany();
  await db.automationStep.deleteMany();
  await db.automation.deleteMany();
  await db.broadcast.deleteMany();
  await db.channel.deleteMany();
  await db.workspaceUser.deleteMany();
  await db.user.deleteMany();
  await db.workspace.deleteMany();
}

describe("billing plans and entitlements", () => {
  beforeEach(async () => {
    await cleanDb();
  });

  it("has the official Starter / Creator / Pro / Business limits", () => {
    expect(getPlan("starter")?.priceMonthly).toBe(199);
    expect(getPlan("creator")?.messageEventsLimit).toBe(30000);
    expect(getPlan("creator")?.automationsLimit).toBeNull();
    expect(getPlan("pro")?.apiAccess).toBe(true);
    expect(getPlan("business")?.conversationRetentionDays).toBe(365);
  });

  it("adds addon limits to the current billing period", async () => {
    const workspace = await db.workspace.create({
      data: { id: "addon-workspace", name: "Addon Workspace", slug: "addon-workspace" },
    });
    await db.subscription.create({
      data: {
        workspaceId: workspace.id,
        planKey: "creator",
        status: "active",
        interval: "month",
        amount: 599,
      },
    });
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    await db.subscriptionAddon.create({
      data: {
        workspaceId: workspace.id,
        addonKey: "events_20000",
        quantity: 1,
        amount: billingAddons.find((addon) => addon.key === "events_20000")!.priceMonthly,
        periodStart: now,
        periodEnd,
      },
    });

    const entitlement = await getWorkspaceEntitlement(workspace.id);
    expect(entitlement.planKey).toBe("creator");
    expect(entitlement.limits.messageEvents).toBe(50000);
  });

  it("blocks automation when the message event limit is reached", async () => {
    const workspace = await db.workspace.create({
      data: { id: "limited-workspace", name: "Limited Workspace", slug: "limited-workspace" },
    });
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    await db.usagePeriod.create({
      data: {
        workspaceId: workspace.id,
        periodStart: start,
        periodEnd: end,
        messageEventsCount: 3000,
      },
    });

    await expect(assertWorkspaceLimit(workspace.id, "messageEvents")).rejects.toThrow("Trial");
  });
});
