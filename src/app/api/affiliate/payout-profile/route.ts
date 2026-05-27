import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { upsertPayoutProfile } from "@/lib/billing/affiliate-service";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (auth.response) return auth.response;
  const body = await request.json().catch(() => ({}));
  try {
    const profile = await upsertPayoutProfile({
      userId: auth.user.id,
      legalName: String(body.legalName || ""),
      identityType: body.identityType === "company" ? "company" : "individual",
      taxId: String(body.taxId || ""),
      bankCode: String(body.bankCode || ""),
      bankBranchCode: body.bankBranchCode ? String(body.bankBranchCode) : undefined,
      bankAccount: String(body.bankAccount || ""),
      bankAccountName: String(body.bankAccountName || ""),
      phone: String(body.phone || ""),
      email: String(body.email || auth.user.email),
      address: String(body.address || ""),
      taxResidentCountry: String(body.taxResidentCountry || "TW"),
    });
    return NextResponse.json({ ok: true, profile: { ...profile, taxIdEncrypted: undefined, bankAccountEncrypted: undefined } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "儲存失敗。" }, { status: 400 });
  }
}
