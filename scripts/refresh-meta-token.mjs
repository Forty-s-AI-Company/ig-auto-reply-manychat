import { readFile, writeFile } from "node:fs/promises";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import path from "node:path";
import process from "node:process";
import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

const DEFAULT_GRAPH_API_VERSION = "v25.0";
const DEFAULT_RENEWAL_WINDOW_DAYS = 14;
const META_GRAPH_BASE_URL = "https://graph.facebook.com";
const SECRET_PREFIX = "enc:v1";
const LOCAL_DEV_ENCRYPTION_SECRET = "local-dev-token-encryption-secret-change-before-production";
const DEFAULT_WORKSPACE_ID = "default-workspace";

const envPath = path.resolve(process.cwd(), ".env");
config({ path: envPath, quiet: true });
const prisma = new PrismaClient();

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function isProductionRuntime() {
  return (
    process.env.INBOXPILOT_DEPLOYMENT_ENV === "production" ||
    process.env.INBOXPILOT_DB_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  );
}

function assertNonProductionRuntime() {
  if (!isProductionRuntime()) return;
  throw new Error(
    "scripts/refresh-meta-token.mjs is disabled in production. Use workspace/channel OAuth reconnect so tokens stay tenant-scoped.",
  );
}

function daysToMilliseconds(days) {
  return days * 24 * 60 * 60 * 1000;
}

function getRenewalWindowMs() {
  const raw = process.env.META_TOKEN_RENEWAL_WINDOW_DAYS;
  const days = raw ? Number(raw) : DEFAULT_RENEWAL_WINDOW_DAYS;
  if (!Number.isFinite(days) || days < 1) {
    throw new Error("META_TOKEN_RENEWAL_WINDOW_DAYS must be a positive number.");
  }
  return daysToMilliseconds(days);
}

function shouldRenew(expiresAtIso, renewalWindowMs) {
  if (process.argv.includes("--force")) {
    return true;
  }

  if (!expiresAtIso) {
    return true;
  }

  const expiresAtMs = Date.parse(expiresAtIso);
  if (!Number.isFinite(expiresAtMs)) {
    return true;
  }

  return expiresAtMs - Date.now() <= renewalWindowMs;
}

async function graphGet(version, pathName, params) {
  const url = new URL(`${META_GRAPH_BASE_URL}/${version}/${pathName}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok || data.error) {
    const message = data.error?.message || response.statusText;
    throw new Error(`Meta Graph API request failed: ${message}`);
  }

  return data;
}

async function debugToken(version, appId, appSecret, token) {
  const data = await graphGet(version, "debug_token", {
    input_token: token,
    access_token: `${appId}|${appSecret}`,
  });

  return data.data || {};
}

async function exchangeUserToken(version, appId, appSecret, userToken) {
  return graphGet(version, "oauth/access_token", {
    grant_type: "fb_exchange_token",
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: userToken,
  });
}

async function getPageToken(version, longUserToken, pageId) {
  const data = await graphGet(version, "me/accounts", {
    fields:
      "name,id,access_token,tasks,instagram_business_account{id,username,name},connected_instagram_account{id,username}",
    access_token: longUserToken,
  });

  const pages = Array.isArray(data.data) ? data.data : [];
  const page = pageId ? pages.find((item) => item.id === pageId) : pages[0];
  if (page?.access_token) {
    return page;
  }

  if (pageId) {
    const directPage = await graphGet(version, pageId, {
      fields:
        "name,id,access_token,instagram_business_account{id,username,name},connected_instagram_account{id,username}",
      access_token: longUserToken,
    });

    if (directPage?.access_token) {
      return directPage;
    }
  }

  if (!page?.access_token) {
    throw new Error(
      pageId
        ? `No Page access token found for META_PAGE_ID=${pageId}.`
        : "No Page access token found in /me/accounts.",
    );
  }
}

function quoteEnv(value) {
  return JSON.stringify(value);
}

function setEnvValue(contents, key, value) {
  const line = `${key}=${quoteEnv(value)}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  if (pattern.test(contents)) {
    return contents.replace(pattern, line);
  }

  const separator = contents.endsWith("\n") ? "" : "\n";
  return `${contents}${separator}${line}\n`;
}

async function writeEnvValues(values) {
  let contents = await readFile(envPath, "utf8");
  for (const [key, value] of Object.entries(values)) {
    contents = setEnvValue(contents, key, value);
  }
  await writeFile(envPath, contents, "utf8");
}

function formatDaysUntil(expiresAtIso) {
  const ms = Date.parse(expiresAtIso) - Date.now();
  return Math.max(0, Math.ceil(ms / daysToMilliseconds(1)));
}

function getInstagramBusinessAccountId(page) {
  return page.instagram_business_account?.id || page.connected_instagram_account?.id || "";
}

function getInstagramUsername(page) {
  return page.instagram_business_account?.username || page.connected_instagram_account?.username || "";
}

async function ensureDefaultWorkspace() {
  return prisma.workspace.upsert({
    where: { id: DEFAULT_WORKSPACE_ID },
    update: {},
    create: {
      id: DEFAULT_WORKSPACE_ID,
      name: "Default Workspace",
      slug: "default",
    },
  });
}

function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function getEncryptionKey() {
  const secret =
    process.env.TOKEN_ENCRYPTION_KEY ||
    process.env.AUTH_SECRET ||
    LOCAL_DEV_ENCRYPTION_SECRET;
  return createHash("sha256").update(secret).digest();
}

function isEncryptedSecret(value) {
  return typeof value === "string" && value.startsWith(`${SECRET_PREFIX}:`);
}

function encryptSecret(value) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [
    SECRET_PREFIX,
    iv.toString("base64url"),
    encrypted.toString("base64url"),
    authTag.toString("base64url"),
  ].join(":");
}

function decryptSecret(value) {
  if (!isEncryptedSecret(value)) return value;

  const [, version, ivValue, encryptedValue, authTagValue] = value.split(":");
  if (version !== "v1" || !ivValue || !encryptedValue || !authTagValue) {
    throw new Error("Invalid encrypted secret format.");
  }

  const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), Buffer.from(ivValue, "base64url"));
  decipher.setAuthTag(Buffer.from(authTagValue, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

function readSecret(configJson, plainKey, encryptedKey) {
  if (typeof configJson[plainKey] === "string") {
    return configJson[plainKey];
  }

  if (typeof configJson[encryptedKey] === "string") {
    return decryptSecret(configJson[encryptedKey]);
  }
  return "";
}

function encryptMetaConfig(configJson) {
  const userAccessToken = readSecret(configJson, "userAccessToken", "encryptedUserAccessToken");
  const pageAccessToken = readSecret(configJson, "pageAccessToken", "encryptedPageAccessToken");
  const encryptedConfig = { ...configJson };

  delete encryptedConfig.userAccessToken;
  delete encryptedConfig.pageAccessToken;

  if (userAccessToken) encryptedConfig.encryptedUserAccessToken = encryptSecret(userAccessToken);
  if (pageAccessToken) encryptedConfig.encryptedPageAccessToken = encryptSecret(pageAccessToken);

  return encryptedConfig;
}

async function updateStoredInstagramChannel(page, userAccessToken, userTokenExpiresAt) {
  const workspace = await ensureDefaultWorkspace();
  const instagramBusinessAccountId = getInstagramBusinessAccountId(page);
  if (!instagramBusinessAccountId) return;

  const channels = await prisma.channel.findMany({ where: { workspaceId: workspace.id, type: "instagram" } });
  const existing = channels.find((channel) => {
    const configJson = isObject(channel.configJson) ? channel.configJson : {};
    return configJson.pageId === page.id || configJson.instagramBusinessAccountId === instagramBusinessAccountId;
  });

  const name = getInstagramUsername(page) ? `Instagram @${getInstagramUsername(page)}` : `Instagram ${page.name}`;
  const configJson = encryptMetaConfig({
    ...(existing && isObject(existing.configJson) ? existing.configJson : {}),
    pageId: page.id,
    pageName: page.name,
    userAccessToken,
    pageAccessToken: page.access_token,
    instagramBusinessAccountId,
    instagramUsername: getInstagramUsername(page),
    instagramName: page.instagram_business_account?.name || "",
    userTokenExpiresAt,
    connectedAt:
      existing && isObject(existing.configJson) && typeof existing.configJson.connectedAt === "string"
        ? existing.configJson.connectedAt
        : new Date().toISOString(),
  });

  if (existing) {
    await prisma.channel.update({
      where: { id: existing.id },
      data: { workspaceId: workspace.id, name, enabled: true, configJson },
    });
    return;
  }

  await prisma.channel.upsert({
    where: { workspaceId_type_name: { workspaceId: workspace.id, type: "instagram", name } },
    update: { enabled: true, configJson },
    create: { workspaceId: workspace.id, type: "instagram", name, enabled: true, configJson },
  });
}

async function disableMockChannelWhenInstagramIsReady() {
  const workspace = await ensureDefaultWorkspace();
  const count = await prisma.channel.count({ where: { workspaceId: workspace.id, type: "instagram", enabled: true } });
  if (count === 0) return;

  await prisma.channel.updateMany({
    where: { workspaceId: workspace.id, type: "mock" },
    data: {
      enabled: false,
      configJson: { mode: "disabled_after_instagram_connection" },
    },
  });
}

async function main() {
  assertNonProductionRuntime();

  const version = process.env.META_GRAPH_API_VERSION || DEFAULT_GRAPH_API_VERSION;
  const appId = requiredEnv("META_APP_ID");
  const appSecret = requiredEnv("META_APP_SECRET");
  const userToken = requiredEnv("META_USER_ACCESS_TOKEN");
  const pageId = process.env.META_PAGE_ID?.trim();
  const renewalWindowMs = getRenewalWindowMs();

  const currentDebug = await debugToken(version, appId, appSecret, userToken);
  const currentExpiresAt =
    currentDebug.expires_at && currentDebug.expires_at > 0
      ? new Date(currentDebug.expires_at * 1000).toISOString()
      : process.env.META_USER_ACCESS_TOKEN_EXPIRES_AT || "";

  if (!shouldRenew(currentExpiresAt, renewalWindowMs)) {
    if (pageId && process.env.META_PAGE_ACCESS_TOKEN) {
      await updateStoredInstagramChannel(
        {
          id: pageId,
          name: process.env.META_PAGE_NAME || "Instagram Page",
          access_token: process.env.META_PAGE_ACCESS_TOKEN,
          instagram_business_account: {
            id: process.env.META_INSTAGRAM_BUSINESS_ACCOUNT_ID || "",
            username: process.env.META_INSTAGRAM_USERNAME || "",
          },
        },
        userToken,
        currentExpiresAt,
      );
      await disableMockChannelWhenInstagramIsReady();
    }
    console.log(
      `Meta token is still valid for about ${formatDaysUntil(currentExpiresAt)} day(s). Skipping refresh.`,
    );
    return;
  }

  const exchanged = await exchangeUserToken(version, appId, appSecret, userToken);
  if (!exchanged.access_token) {
    throw new Error("Meta token exchange did not return an access token.");
  }

  const refreshedDebug = await debugToken(version, appId, appSecret, exchanged.access_token);
  const refreshedExpiresAt =
    refreshedDebug.expires_at && refreshedDebug.expires_at > 0
      ? new Date(refreshedDebug.expires_at * 1000).toISOString()
      : new Date(Date.now() + daysToMilliseconds(60)).toISOString();

  const page = await getPageToken(version, exchanged.access_token, pageId);

  await writeEnvValues({
    META_GRAPH_API_VERSION: version,
    META_USER_ACCESS_TOKEN: exchanged.access_token,
    META_USER_ACCESS_TOKEN_EXPIRES_AT: refreshedExpiresAt,
    META_PAGE_ID: page.id,
    META_PAGE_ACCESS_TOKEN: page.access_token,
    META_INSTAGRAM_BUSINESS_ACCOUNT_ID:
      page.instagram_business_account?.id || page.connected_instagram_account?.id || "",
  });

  await updateStoredInstagramChannel(page, exchanged.access_token, refreshedExpiresAt);
  await disableMockChannelWhenInstagramIsReady();

  console.log(
    `Meta token refreshed. Page "${page.name}" (${page.id}) was updated. User token expires at ${refreshedExpiresAt}.`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
