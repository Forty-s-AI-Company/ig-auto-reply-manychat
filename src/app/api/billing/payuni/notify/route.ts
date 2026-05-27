import { NextResponse } from "next/server";
import { handlePayuniCallback } from "@/lib/billing/payuni-callback";

export async function POST(request: Request) {
  try {
    const params = Object.fromEntries((await request.formData()).entries()) as Record<string, string>;
    await handlePayuniCallback(params);
    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: "failed" }, { status: 400 });
  }
}
