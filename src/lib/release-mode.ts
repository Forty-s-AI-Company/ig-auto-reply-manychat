export type ReleaseChannel = "simple" | "full";

export const PRODUCTION_SIMPLE_HOST = "inboxpilot.carry-digital-nomad.in.net";

export const SIMPLE_APP_ROUTE_PREFIXES = [
  "/dashboard",
  "/inbox",
  "/contacts",
  "/channels",
  "/analytics",
  "/automations",
  "/referrals",
  "/profile",
  "/help-center",
  "/status",
  "/privacy-policy",
  "/terms-of-service",
  "/data-deletion",
];

export const FULL_ONLY_APP_ROUTE_PREFIXES = [
  "/admin",
  "/affiliate",
  "/ai-settings",
  "/billing",
  "/broadcasts",
  "/knowledge-base",
  "/mock-tester",
  "/segments",
  "/sequences",
  "/tags",
  "/templates",
  "/wallet",
];

function normalizeHost(host: string) {
  return host.split(":")[0]?.toLowerCase() || "";
}

function envReleaseChannel(): ReleaseChannel | null {
  const value = process.env.INBOXPILOT_RELEASE_CHANNEL?.trim().toLowerCase();
  if (value === "simple" || value === "full") return value;
  return null;
}

export function getReleaseChannelForHost(host: string): ReleaseChannel {
  const override = envReleaseChannel();
  if (override) return override;
  return normalizeHost(host) === PRODUCTION_SIMPLE_HOST ? "simple" : "full";
}

export async function getCurrentReleaseChannel(): Promise<ReleaseChannel> {
  const { headers } = await import("next/headers");
  const headerStore = await headers();
  return getReleaseChannelForHost(headerStore.get("host") || "");
}

export async function isSimpleRelease(): Promise<boolean> {
  return (await getCurrentReleaseChannel()) === "simple";
}

export function isFullOnlyAppPath(pathname: string) {
  return FULL_ONLY_APP_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
