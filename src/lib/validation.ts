import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const signupSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(200),
  workspaceName: z.string().min(1).max(80),
  referralCode: z.string().max(80).optional().nullable(),
});

export const workspaceCreateSchema = z.object({
  name: z.string().min(1).max(80),
});

export const workspaceScopeSchema = z.object({
  workspaceId: z.string().min(1),
});

export const billingCheckoutSchema = z.object({
  planKey: z.string().min(1).max(80),
  interval: z.enum(["month", "year"]).default("month"),
  addonKeys: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) => {
      if (!value) return [];
      return Array.isArray(value) ? value : [value];
    }),
  useCredits: z.coerce.boolean().default(true),
});

export const aiSettingSchema = z.object({
  provider: z.enum(["chatgpt", "gemini", "deepseek", "xai", "codex_cli", "antigravity_cli"]),
  model: z.string().min(1).max(120),
  reasoningEffort: z.enum(["minimal", "low", "medium", "high", "xhigh"]).default("medium"),
  thinkingLevel: z.enum(["none", "low", "medium", "high"]).default("medium"),
});

export const aiCredentialSchema = z.object({
  provider: z.enum(["chatgpt", "gemini", "deepseek", "xai", "codex_cli", "antigravity_cli"]),
  apiKey: z.string().max(4000).default(""),
});

export const aiModelTestSchema = z.object({
  provider: z.enum(["chatgpt", "gemini", "deepseek", "xai", "codex_cli", "antigravity_cli"]),
  model: z.string().min(1).max(120),
  reasoningEffort: z.enum(["minimal", "low", "medium", "high", "xhigh"]).default("medium"),
  thinkingLevel: z.enum(["none", "low", "medium", "high"]).default("medium"),
});

export const tagSchema = z.object({
  name: z.string().min(1).max(40),
  color: z.string().min(4).max(20).default("#2563eb"),
});

export const segmentSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(240).optional().nullable(),
  filterJson: z
    .object({
      tagId: z.string().min(1).optional().nullable(),
      consentStatus: z.enum(["opted_in", "opted_out", "unknown"]).optional().nullable(),
      channelId: z.string().min(1).optional().nullable(),
      lastInboundWithinDays: z.coerce.number().int().positive().max(365).optional().nullable(),
    })
    .default({}),
});

export const contactFieldDefinitionSchema = z.object({
  key: z.string().min(1).max(60).regex(/^[a-zA-Z][a-zA-Z0-9_]*$/),
  label: z.string().min(1).max(80),
  type: z.enum(["text", "number", "date", "boolean", "url", "email", "phone"]).default("text"),
});

export const contactFieldValueSchema = z.object({
  definitionId: z.string().min(1).optional(),
  key: z.string().min(1).max(60).optional(),
  value: z.string().max(2000).default(""),
}).refine((value) => Boolean(value.definitionId || value.key), {
  message: "definitionId or key is required.",
});

export const sequenceSchema = z.object({
  name: z.string().min(1).max(120),
  enabled: z.boolean().default(true),
  steps: z
    .array(
      z.object({
        id: z.string().optional(),
        order: z.coerce.number().int().positive(),
        delaySeconds: z.coerce.number().int().min(0).max(60 * 60 * 24 * 365).default(0),
        messageJson: z.object({ text: z.string().min(1).max(2000) }),
      }),
    )
    .min(1),
});

export const sequenceSubscribeSchema = z.object({
  contactId: z.string().min(1),
});

export const automationSchema = z.object({
  name: z.string().min(1),
  folderId: z.string().min(1).optional().nullable(),
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

export const automationFolderSchema = z.object({
  name: z.string().min(1).max(80),
});

export const knowledgeBaseSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  enabled: z.boolean().default(true),
});

export const broadcastSchema = z.object({
  name: z.string().min(1),
  targetConfigJson: z.union([
    z.object({ tagId: z.string().min(1), segmentId: z.string().optional().nullable() }),
    z.object({ segmentId: z.string().min(1), tagId: z.string().optional().nullable() }),
  ]),
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

export const internalNoteSchema = z.object({
  text: z.string().min(1).max(2000),
});

export const automationManualRunSchema = z.object({
  contactId: z.string().min(1),
  conversationId: z.string().min(1).optional(),
  text: z.string().max(2000).default(""),
});

export const automationWebhookRunSchema = z.object({
  externalId: z.string().min(1),
  channelType: z.enum(["mock", "telegram", "instagram", "messenger", "whatsapp"]).default("mock"),
  channelName: z.string().min(1).max(120).optional(),
  displayName: z.string().min(1).max(120).optional(),
  text: z.string().max(2000).default(""),
  consentStatus: z.enum(["opted_in", "opted_out", "unknown"]).default("unknown"),
});

export const conversationStatusSchema = z.object({
  status: z.enum(["open", "pending", "closed"]),
});

export const conversationUpdateSchema = z
  .object({
    status: z.enum(["open", "pending", "closed"]).optional(),
    assignedToId: z.string().min(1).nullable().optional(),
    reminderAt: z.string().datetime().nullable().optional(),
    isFavorite: z.boolean().optional(),
    lastReadAt: z.string().datetime().nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one conversation field is required.",
  });
