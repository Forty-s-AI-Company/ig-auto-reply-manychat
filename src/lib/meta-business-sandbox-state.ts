import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { SandboxMetaBusinessProviderId, SandboxTransport } from "@/lib/meta-business-sandbox";

export type SandboxOAuthStateRecord = {
  stateHash: string;
  nonceHash: string;
  workspaceId: string;
  userId: string;
  providerId: SandboxMetaBusinessProviderId;
  transport: SandboxTransport;
  createdAt: Date;
  expiresAt: Date;
  usedAt: Date | null;
};

export type SandboxOAuthStateBundle = {
  rawState: string;
  rawNonce: string;
  record: SandboxOAuthStateRecord;
  redacted: {
    state: "[REDACTED_STATE]";
    nonce: "[REDACTED_NONCE]";
    stateId: string;
    nonceId: string;
  };
};

export type SandboxOAuthStateVerifyInput = {
  rawState: string | null;
  rawNonce: string | null;
  record: SandboxOAuthStateRecord | null;
  providerId: SandboxMetaBusinessProviderId;
  workspaceId: string;
  userId: string;
  now?: Date;
};

export type SandboxOAuthStateVerifyResult =
  | { ok: true; record: SandboxOAuthStateRecord }
  | { ok: false; errorType: "invalid_state" | "state_expired" | "state_replayed" | "workspace_mismatch" | "nonce_mismatch" };

const DEFAULT_STATE_TTL_MS = 10 * 60 * 1000;

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function safeEqualHex(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function redactedId(prefix: string, hash: string) {
  return `${prefix}_${hash.slice(0, 8)}`;
}

export function createSandboxOAuthState(input: {
  workspaceId: string;
  userId: string;
  providerId: SandboxMetaBusinessProviderId;
  transport: SandboxTransport;
  now?: Date;
  ttlMs?: number;
}): SandboxOAuthStateBundle {
  const now = input.now || new Date();
  const rawState = `sbl_${randomBytes(24).toString("base64url")}`;
  const rawNonce = `nonce_${randomBytes(24).toString("base64url")}`;
  const stateHash = sha256(rawState);
  const nonceHash = sha256(rawNonce);

  return {
    rawState,
    rawNonce,
    record: {
      stateHash,
      nonceHash,
      workspaceId: input.workspaceId,
      userId: input.userId,
      providerId: input.providerId,
      transport: input.transport,
      createdAt: now,
      expiresAt: new Date(now.getTime() + (input.ttlMs || DEFAULT_STATE_TTL_MS)),
      usedAt: null,
    },
    redacted: {
      state: "[REDACTED_STATE]",
      nonce: "[REDACTED_NONCE]",
      stateId: redactedId("state", stateHash),
      nonceId: redactedId("nonce", nonceHash),
    },
  };
}

export function verifySandboxOAuthState(input: SandboxOAuthStateVerifyInput): SandboxOAuthStateVerifyResult {
  const now = input.now || new Date();
  if (!input.rawState || !input.rawNonce || !input.record) return { ok: false, errorType: "invalid_state" };
  if (input.record.usedAt) return { ok: false, errorType: "state_replayed" };
  if (input.record.expiresAt.getTime() <= now.getTime()) return { ok: false, errorType: "state_expired" };
  if (input.record.providerId !== input.providerId) return { ok: false, errorType: "invalid_state" };
  if (input.record.workspaceId !== input.workspaceId || input.record.userId !== input.userId) {
    return { ok: false, errorType: "workspace_mismatch" };
  }
  if (!safeEqualHex(input.record.stateHash, sha256(input.rawState))) return { ok: false, errorType: "invalid_state" };
  if (!safeEqualHex(input.record.nonceHash, sha256(input.rawNonce))) return { ok: false, errorType: "nonce_mismatch" };
  return { ok: true, record: input.record };
}

export function consumeSandboxOAuthState(record: SandboxOAuthStateRecord, now = new Date()): SandboxOAuthStateRecord {
  return { ...record, usedAt: now };
}

export function redactSandboxOAuthStateForAudit(record: SandboxOAuthStateRecord) {
  return {
    state: "[REDACTED_STATE]",
    nonce: "[REDACTED_NONCE]",
    stateId: redactedId("state", record.stateHash),
    nonceId: redactedId("nonce", record.nonceHash),
    providerId: record.providerId,
    transport: record.transport,
    workspaceId: "[REDACTED_WORKSPACE]",
    userId: "[REDACTED_USER]",
    expiresAt: record.expiresAt.toISOString(),
    used: Boolean(record.usedAt),
  };
}
