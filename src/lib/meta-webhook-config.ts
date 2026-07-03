import { isMetaGlobalEnvFallbackEnabled } from "@/lib/channels/meta";

export function buildWebhookChannelConfig(existingConfig: Record<string, unknown>, hasStoredPageToken: boolean) {
  if (!isMetaGlobalEnvFallbackEnabled()) return existingConfig;

  return {
    ...existingConfig,
    pageId: "pageId" in existingConfig ? existingConfig.pageId : process.env.META_PAGE_ID || "",
    instagramBusinessAccountId:
      "instagramBusinessAccountId" in existingConfig
        ? existingConfig.instagramBusinessAccountId
        : process.env.META_INSTAGRAM_BUSINESS_ACCOUNT_ID || "",
    ...(hasStoredPageToken ? {} : { tokenEnv: "META_PAGE_ACCESS_TOKEN" }),
  };
}
