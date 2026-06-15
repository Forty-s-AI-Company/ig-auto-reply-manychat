import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import {
  buildSandboxCallbackIntegratedDryRunPayload,
  isSandboxMetaBusinessProviderId,
  readSandboxTransport,
  validateSandboxAccess,
} from "@/lib/meta-business-sandbox";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

type RouteContext = {
  params: Promise<{ provider: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireApiUser();
  const { provider } = await context.params;
  if (auth.response && !isSandboxMetaBusinessProviderId(provider)) return auth.response;

  const workspaceId = auth.user ? await getCurrentWorkspaceId() : "";
  const url = new URL(request.url);
  const access = validateSandboxAccess({
    nodeEnv: process.env.NODE_ENV,
    providerId: provider,
    workspaceId,
    queryWorkspaceId: url.searchParams.get("workspaceId"),
    user: auth.user,
    sandboxHeader: request.headers.get("x-inboxpilot-sandbox"),
  });

  if (!access.ok) {
    return NextResponse.json({ status: "error", mode: "dry_run", errorType: access.errorType }, { status: access.status });
  }
  if (!isSandboxMetaBusinessProviderId(provider)) {
    return NextResponse.json({ status: "error", mode: "dry_run", errorType: "unsupported_provider" }, { status: 404 });
  }

  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const payload = await buildSandboxCallbackIntegratedDryRunPayload({
    providerId: provider,
    workspaceId,
    requestId,
    transport: readSandboxTransport(url.searchParams.get("transport")),
    query: url.searchParams,
  });

  return NextResponse.json(
    payload,
    { headers: { "cache-control": "no-store", "x-request-id": requestId } },
  );
}
