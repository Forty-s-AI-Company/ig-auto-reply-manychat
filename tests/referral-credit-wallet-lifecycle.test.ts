import { beforeEach, describe, expect, it } from "vitest";
import { addDays } from "@/lib/billing/calculations";
import { createReferralCredit, getWalletSummary } from "@/lib/billing/wallet-service";
import { getDb } from "@/lib/db";
import { loadProjectEnv } from "../scripts/load-env.mjs";

loadProjectEnv();

const db = getDb();
const userId = "wallet-lifecycle-user";

async function cleanDb() {
  await db.walletLedger.deleteMany({ where: { userId } });
  await db.user.deleteMany({ where: { id: userId } });
}

describe("referral credit wallet lifecycle", () => {
  beforeEach(async () => {
    await cleanDb();
    await db.user.create({
      data: {
        id: userId,
        email: "wallet-lifecycle@example.com",
        name: "Wallet Lifecycle",
        passwordHash: "test",
      },
    });
  });

  it("creates pending referral credit first, then auto-releases when availableAt is reached", async () => {
    const futureAvailableAt = addDays(new Date(), 7);
    const expiresAt = addDays(futureAvailableAt, 30);

    const entry = await createReferralCredit({
      userId,
      amount: 59,
      availableAt: futureAvailableAt,
      expiresAt,
    });

    expect(entry?.status).toBe("pending");

    await db.walletLedger.update({
      where: { id: entry!.id },
      data: { availableAt: addDays(new Date(), -1) },
    });

    const summary = await getWalletSummary(userId);
    expect(summary.pendingCredits).toBe(0);
    expect(summary.availableCredits).toBe(59);
  });

  it("expires available referral credit after the expiry date passes", async () => {
    await db.walletLedger.create({
      data: {
        userId,
        type: "credit",
        source: "referral_credit",
        amount: 80,
        status: "available",
        availableAt: addDays(new Date(), -40),
        expiresAt: addDays(new Date(), -1),
      },
    });

    const summary = await getWalletSummary(userId);
    expect(summary.availableCredits).toBe(0);
    expect(summary.expiredCredits).toBe(80);
  });
});
