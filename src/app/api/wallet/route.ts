import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { getWalletLedger, getWalletSummary } from "@/lib/billing/wallet-service";

export async function GET() {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const [summary, ledger] = await Promise.all([
    getWalletSummary(auth.user.id),
    getWalletLedger(auth.user.id),
  ]);
  return NextResponse.json({ summary, ledger });
}
