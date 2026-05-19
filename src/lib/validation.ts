import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const tagSchema = z.object({
  name: z.string().min(1).max(40),
  color: z.string().min(4).max(20).default("#2563eb"),
});

export const automationSchema = z.object({
  name: z.string().min(1),
  enabled: z.boolean().default(true),
  triggerType: z.enum(["keyword", "new_contact", "manual", "webhook"]),
  triggerConfigJson: z.unknown().default({}),
  steps: z
    .array(
      z.object({
        id: z.string().optional(),
        order: z.coerce.number().int().positive(),
        type: z.enum([
          "send_message",
          "add_tag",
          "remove_tag",
          "wait",
          "condition",
          "ai_reply",
          "set_field",
        ]),
        configJson: z.unknown().default({}),
      }),
    )
    .default([]),
});

export const knowledgeBaseSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  enabled: z.boolean().default(true),
});

export const broadcastSchema = z.object({
  name: z.string().min(1),
  targetConfigJson: z.object({ tagId: z.string().min(1) }),
  messageJson: z.object({ text: z.string().min(1).max(2000) }),
  scheduledAt: z.string().datetime().optional().nullable(),
});

export const mockInboundSchema = z.object({
  externalId: z.string().min(1),
  displayName: z.string().min(1),
  text: z.string().min(1),
  consentStatus: z.enum(["opted_in", "opted_out", "unknown"]).default("opted_in"),
});

export const outboundMessageSchema = z.object({
  text: z.string().min(1).max(2000),
});

export const conversationStatusSchema = z.object({
  status: z.enum(["open", "pending", "closed"]),
});
