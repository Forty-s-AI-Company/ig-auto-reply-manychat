import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { isProductionDeploymentEnv } from "@/lib/deployment-env";

const SECRET_PREFIX = "enc:v1";
const LOCAL_DEV_ENCRYPTION_SECRET = "local-dev-token-encryption-secret-change-before-production";
const MIN_PRODUCTION_ENCRYPTION_KEY_LENGTH = 32;

function getEncryptionSecret() {
  const tokenEncryptionKey = process.env.TOKEN_ENCRYPTION_KEY?.trim();

  if (isProductionDeploymentEnv()) {
    if (!tokenEncryptionKey || tokenEncryptionKey.length < MIN_PRODUCTION_ENCRYPTION_KEY_LENGTH) {
      throw new Error("TOKEN_ENCRYPTION_KEY must be set to a strong production-only value.");
    }

    if (process.env.AUTH_SECRET?.trim() && tokenEncryptionKey === process.env.AUTH_SECRET.trim()) {
      throw new Error("TOKEN_ENCRYPTION_KEY must be separate from AUTH_SECRET in production.");
    }

    return tokenEncryptionKey;
  }

  return tokenEncryptionKey || process.env.AUTH_SECRET || LOCAL_DEV_ENCRYPTION_SECRET;
}

function getEncryptionKey() {
  return createHash("sha256").update(getEncryptionSecret()).digest();
}

function toBase64Url(buffer: Buffer) {
  return buffer.toString("base64url");
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url");
}

export function isEncryptedSecret(value: unknown) {
  return typeof value === "string" && value.startsWith(`${SECRET_PREFIX}:`);
}

export function encryptSecret(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [SECRET_PREFIX, toBase64Url(iv), toBase64Url(encrypted), toBase64Url(authTag)].join(":");
}

export function decryptSecret(value: string) {
  if (!isEncryptedSecret(value)) return value;

  const [, version, ivValue, encryptedValue, authTagValue] = value.split(":");
  if (version !== "v1" || !ivValue || !encryptedValue || !authTagValue) {
    throw new Error("Invalid encrypted secret format.");
  }

  const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), fromBase64Url(ivValue));
  decipher.setAuthTag(fromBase64Url(authTagValue));
  return Buffer.concat([
    decipher.update(fromBase64Url(encryptedValue)),
    decipher.final(),
  ]).toString("utf8");
}

export function tryDecryptSecret(value: string) {
  try {
    return decryptSecret(value);
  } catch {
    return null;
  }
}
