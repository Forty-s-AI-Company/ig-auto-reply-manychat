import { NextResponse } from "next/server";
import { billingAddons, billingPlans } from "@/lib/billing/plans";

export async function GET() {
  return NextResponse.json({ plans: billingPlans, addons: billingAddons });
}
