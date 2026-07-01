import { beforeEach, describe, expect, it } from "vitest";
import { addDays } from "@/lib/billing/calculations";
import { markInvoiceRefunded } from "@/lib/billing/invoice-service";
import { createReferralCredit } from "@/lib/billing/wallet-service";
import { getDb } from "@/lib/db";
import { loadProjectEnv } from "../scripts/load-env.mjs";

loadProjectEnv();

const db = getDb();
const fixtureIds = ["pending-refund", "available-refund"];

async function cleanDb() {
  const userIds = fixtureIds.flatMap((id) => [`${id}-referrer`, `${id}-referred`]);
  const workspaceIds = fixtureIds.map((id) => `${id}-workspace`);
  const invoiceIds = fixtureIds.map((id) => `${id}-invoice`);

  await db.walletLedger.deleteMany({ where: { OR: [{ userId: { in: userIds } }, { relatedInvoiceId: { in: invoiceIds } }] } });
  await db.paymentOrder.deleteMany({ where: { OR: [{ userId: { in: userIds } }, { invoiceId: { in: invoiceIds } }, { workspaceId: { in: workspaceIds } }] } });
  await db.invoiceItem.deleteMany({ where: { invoiceId: { in: invoiceIds } } });
  await db.invoice.deleteMany({ where: { id: { in: invoiceIds } } });
  await db.workspaceUser.deleteMany({ where: { OR: [{ userId: { in: userIds } }, { workspaceId: { in: workspaceIds } }] } });
  await db.user.deleteMany({ where: { id: { in: userIds } } });
  await db.workspace.deleteMany({ where: { id: { in: workspaceIds } } });
}

async function seedInvoice(id: string) {
  const workspace = await db.workspace.create({
    data: { id: `${id}-workspace`, name: `${id} Workspace`, slug: `${id}-workspace` },
  });
  const referrer = await db.user.create({
    data: { id: `${id}-referrer`, email: `${id}-referrer@example.com`, name: "Referrer", passwordHash: "test" },
  });
  const referred = await db.user.create({
    data: { id: `${id}-referred`, email: `${id}-referred@example.com`, name: "Referred", passwordHash: "test" },
  });
  await db.workspaceUser.create({ data: { workspaceId: workspace.id, userId: referred.id, role: "admin" } });
  const invoice = await db.invoice.create({
    data: {
      id: `${id}-invoice`,
      invoiceNumber: `INV-${id}`,
      workspaceId: workspace.id,
      userId: referred.id,
      periodStart: new Date(),
      periodEnd: addDays(new Date(), 30),
      subtotalAmount: 199,
      totalAmount: 199,
      status: "paid",
      paidAt: new Date(),
    },
  });

  return { invoice, referrer, workspace };
}

describe("referral credit refund lifecycle", () => {
  beforeEach(async () => {
    await cleanDb();
  });

  it("cancels pending referral credit when the source invoice is refunded", async () => {
    const { invoice, referrer, workspace } = await seedInvoice("pending-refund");
    const availableAt = addDays(new Date(), 7);
    const credit = await createReferralCredit({
      userId: referrer.id,
      workspaceId: workspace.id,
      amount: 59,
      relatedInvoiceId: invoice.id,
      availableAt,
      expiresAt: addDays(availableAt, 30),
    });

    const result = await markInvoiceRefunded(invoice.id);
    const ledger = await db.walletLedger.findUnique({ where: { id: credit!.id } });

    expect(result.invoice.status).toBe("refunded");
    expect(result.referralCreditReconciliation.cancelledPendingAmount).toBe(59);
    expect(result.referralCreditReconciliation.clawbackAmount).toBe(0);
    expect(ledger?.status).toBe("cancelled");
  });

  it("creates an idempotent clawback debit for available referral credit when refunded later", async () => {
    const { invoice, referrer, workspace } = await seedInvoice("available-refund");
    await createReferralCredit({
      userId: referrer.id,
      workspaceId: workspace.id,
      amount: 59,
      relatedInvoiceId: invoice.id,
      availableAt: addDays(new Date(), -1),
      expiresAt: addDays(new Date(), 30),
    });

    const first = await markInvoiceRefunded(invoice.id);
    const second = await markInvoiceRefunded(invoice.id);
    const clawbacks = await db.walletLedger.findMany({
      where: { userId: referrer.id, relatedInvoiceId: invoice.id, source: "clawback", type: "debit" },
    });

    expect(first.referralCreditReconciliation.clawbackAmount).toBe(59);
    expect(second.referralCreditReconciliation.clawbackAmount).toBe(0);
    expect(clawbacks).toHaveLength(1);
    expect(clawbacks[0].amount).toBe(59);
    expect(clawbacks[0].status).toBe("used");
  });
});
