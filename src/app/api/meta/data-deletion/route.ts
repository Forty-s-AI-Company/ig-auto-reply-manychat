import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(normalized + padding, "base64");
}

function getAppUrl(request: Request) {
  return (process.env.APP_URL || new URL(request.url).origin).replace(/\/$/, "");
}

function verifySignedRequest(signedRequest: string) {
  const appSecret = process.env.META_APP_SECRET?.trim();
  if (!appSecret) throw new Error("META_APP_SECRET is not configured.");

  const [encodedSignature, payload] = signedRequest.split(".");
  if (!encodedSignature || !payload) throw new Error("Invalid signed_request.");

  const expected = createHmac("sha256", appSecret).update(payload).digest();
  const actual = base64UrlDecode(encodedSignature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    throw new Error("Invalid signed_request signature.");
  }

  return JSON.parse(base64UrlDecode(payload).toString("utf8")) as { user_id?: string };
}

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  const signedRequest = formData?.get("signed_request");
  if (typeof signedRequest !== "string") {
    return NextResponse.json({ error: "signed_request is required." }, { status: 400 });
  }

  const payload = verifySignedRequest(signedRequest);
  const confirmationCode = `meta-delete-${payload.user_id || "unknown"}-${Date.now()}`;

  return NextResponse.json({
    url: `${getAppUrl(request)}/data-deletion?confirmation_code=${encodeURIComponent(confirmationCode)}`,
    confirmation_code: confirmationCode,
  });
}

export async function GET(request: Request) {
  return NextResponse.redirect(`${getAppUrl(request)}/data-deletion`);
}
