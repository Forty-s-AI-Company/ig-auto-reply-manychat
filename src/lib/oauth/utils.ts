import { Prisma } from "@prisma/client";
import { getAppUrl } from "@/lib/app-url";

export function asJsonObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function toPrismaJson(value: Record<string, unknown> | undefined): Prisma.InputJsonValue {
  return (value || {}) as Prisma.InputJsonValue;
}

export function getPopupOrigin(request: Request) {
  return getAppUrl(request);
}

export function getProviderCallbackUrl(request: Request, provider: string) {
  return `${getAppUrl(request)}/api/oauth/${provider}/callback`;
}

export function getProviderAuthorizeUrl(request: Request, provider: string) {
  return `${getAppUrl(request)}/api/oauth/${provider}/authorize`;
}

export function getPopupBridgeUrl(request: Request, payload: Record<string, string>) {
  const url = new URL(`${getAppUrl(request)}/oauth/popup/callback`);
  for (const [key, value] of Object.entries(payload)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}
