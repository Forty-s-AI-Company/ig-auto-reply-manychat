import { Prisma } from "@prisma/client";
import { getDb } from "@/lib/db";

export type AuditResourceType =
  | "auth"
  | "billing"
  | "broadcast"
  | "channel"
  | "conversation"
  | "sequence"
  | "workspace"
  | "webhook";

export type RecordAuditEventInput = {
  action: string;
  resourceType: AuditResourceType;
  resourceId?: string;
  workspaceId?: string | null;
  userId?: string | null;
  success?: boolean;
  actorIp?: string | null;
  userAgent?: string | null;
  metadata?: Prisma.InputJsonValue;
};

export async function recordAuditEvent(input: RecordAuditEventInput) {
  try {
    await getDb().auditEvent.create({
      data: {
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        workspaceId: input.workspaceId ?? null,
        userId: input.userId ?? null,
        success: input.success ?? true,
        actorIp: input.actorIp ?? null,
        userAgent: input.userAgent ?? null,
        metadataJson: input.metadata ?? {},
      },
    });
  } catch (error) {
    console.warn("[audit] failed to record event", error);
  }
}
