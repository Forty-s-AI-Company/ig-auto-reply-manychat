import { NextResponse } from "next/server";
import { handlePayuniCallback } from "@/lib/billing/payuni-callback";
import { assertRateLimit, getClientIp } from "@/lib/security";

function appRedirect(path: string, request: Request) {
  const base = (process.env.APP_URL || new URL(request.url).origin).replace(/\/$/, "");
  return new URL(path, base);
}

function processingHtml(request: Request) {
  const billingUrl = appRedirect("/billing", request).toString();
  return `<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="refresh" content="1;url=${billingUrl}" />
    <title>InboxPilot｜驗證付款中</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f5fbfc; color: #111827; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      .card { width: min(420px, calc(100vw - 32px)); border: 1px solid #d7dbe0; border-radius: 16px; background: #fff; padding: 28px; box-shadow: 0 20px 60px rgba(15, 23, 42, .08); }
      .brand { color: #064e54; font-weight: 800; letter-spacing: .01em; }
      .spinner { width: 36px; height: 36px; margin: 22px 0; border: 4px solid #d9f7f8; border-top-color: #19d3d8; border-radius: 999px; animation: spin 1s linear infinite; }
      p { color: #667085; line-height: 1.7; margin: 0; }
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
  </head>
  <body>
    <main class="card" aria-live="polite">
      <div class="brand">InboxPilot</div>
      <div class="spinner" aria-hidden="true"></div>
      <h1>驗證付款中...</h1>
      <p>正在確認付款結果，完成後會自動回到方案與用量頁。</p>
    </main>
  </body>
</html>`;
}

export async function POST(request: Request) {
  const rateLimitFailure = await assertRateLimit({
    key: `payuni-return:${getClientIp(request)}`,
    limit: 120,
    windowMs: 60 * 1000,
  });
  if (rateLimitFailure) return rateLimitFailure;

  try {
    const params = Object.fromEntries((await request.formData()).entries()) as Record<string, string>;
    const result = await handlePayuniCallback(params);
    return NextResponse.redirect(
      appRedirect(`/billing?payment=${result.paid ? "success" : "failed"}`, request),
      303,
    );
  } catch {
    console.error("[payuni:return] callback handling failed");
    return NextResponse.redirect(appRedirect("/billing?payment=failed", request), 303);
  }
}

export async function GET(request: Request) {
  return new NextResponse(processingHtml(request), {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
