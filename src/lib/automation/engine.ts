import type { Automation, AutomationStep, Prisma } from "@prisma/client";
import { generateFaqReply } from "@/lib/ai/faq";
import { recordMessageEvent } from "@/lib/billing/usage-service";
import { getDb } from "@/lib/db";
import { sendOutboundMessage } from "@/lib/messages";
import { getDefaultWorkspaceId } from "@/lib/workspaces";

type AutomationWithSteps = Automation & { steps: AutomationStep[] };
type StepResult =
  | { status: "completed" }
  | { status: "paused" }
  | { status: "stop" }
  | { status: "skip"; nextOrder: number };
type ConditionContact = {
  consentStatus: string;
  tags: Array<{ tag: { name: string } }>;
} | null;

function asRecord(value: unknown) {
  return (value || {}) as Record<string, unknown>;
}

function interpolate(text: string) {
  return text.replaceAll("{{demo_link}}", process.env.DEMO_LINK || "https://example.com/demo-download");
}

async function appendRunLog(runId: string, log: Prisma.JsonObject) {
  const db = getDb();
  const run = await db.automationRun.findUnique({ where: { id: runId } });
  const logs = Array.isArray(run?.logsJson) ? (run.logsJson as Prisma.JsonArray) : [];
  await db.automationRun.update({
    where: { id: runId },
    data: {
      logsJson: [...logs, { at: new Date().toISOString(), ...log }] as Prisma.InputJsonValue,
    },
  });
}

async function runStep(input: {
  runId: string;
  step: AutomationStep;
  contactId: string;
  conversationId: string;
  inboundText: string;
}): Promise<StepResult> {
  const db = getDb();
  const config = asRecord(input.step.configJson);
  const contact = await db.contact.findUnique({
    where: { id: input.contactId },
    include: { channel: { select: { workspaceId: true } }, tags: { include: { tag: true } } },
  });
  const workspaceId = contact?.channel.workspaceId || (await getDefaultWorkspaceId());

  if (input.step.type === "send_message") {
    const text = interpolate(String(config.text || ""));
    if (text) await sendOutboundMessage(input.conversationId, text, { source: "automation", eventType: "auto_dm_sent" });
  }

  if (input.step.type === "add_tag") {
    const tagName = String(config.tagName || "");
    const tagId = String(config.tagId || "");
    const tag = tagId
      ? await db.tag.findUnique({ where: { id: tagId } })
      : tagName
        ? await db.tag.upsert({
            where: { workspaceId_name: { workspaceId, name: tagName } },
            update: {},
            create: { workspaceId, name: tagName, color: "#2563eb" },
          })
        : null;
    if (tag) {
      await db.contactTag.upsert({
        where: { contactId_tagId: { contactId: input.contactId, tagId: tag.id } },
        update: {},
        create: { contactId: input.contactId, tagId: tag.id },
      });
    }
  }

  if (input.step.type === "remove_tag") {
    const tagName = String(config.tagName || "");
    const tagId = String(config.tagId || "");
    const tag = tagId
        ? await db.tag.findUnique({ where: { id: tagId } })
      : tagName
        ? await db.tag.findUnique({ where: { workspaceId_name: { workspaceId, name: tagName } } })
        : null;
    if (tag) {
      await db.contactTag.deleteMany({
        where: { contactId: input.contactId, tagId: tag.id },
      });
    }
  }

  if (input.step.type === "wait") {
    const seconds = Math.max(1, Number(config.seconds || 5));
    await db.job.create({
      data: {
        workspaceId,
        type: "automation_continue",
        status: "queued",
        runAt: new Date(Date.now() + seconds * 1000),
        payloadJson: { runId: input.runId },
      },
    });
    await appendRunLog(input.runId, { step: input.step.order, type: input.step.type, queued: true });
    return { status: "paused" };
  }

  if (input.step.type === "condition") {
    const passed = evaluateCondition({
      config,
      inboundText: input.inboundText,
      contact,
    });
    await appendRunLog(input.runId, {
      step: input.step.order,
      type: input.step.type,
      passed,
    });

    if (passed) return { status: "completed" };

    const falseAction = String(config.falseAction || "stop");
    if (falseAction === "continue") return { status: "completed" };
    if (falseAction === "skip") {
      const nextOrder = Math.max(1, Number(config.skipToOrder || input.step.order + 1));
      return { status: "skip", nextOrder };
    }
    return { status: "stop" };
  }

  if (input.step.type === "ai_reply") {
    await recordMessageEvent({
      workspaceId,
      contactId: input.contactId,
      type: "ai_faq_executed",
      source: "automation:ai_reply",
      metadata: { runId: input.runId, stepId: input.step.id },
    });
    const reply = await generateFaqReply(input.inboundText, String(config.prompt || ""), workspaceId);
    await sendOutboundMessage(input.conversationId, reply, { source: "automation", eventType: "dm_auto_replied" });
  }

  if (input.step.type === "set_field") {
    const field = String(config.field || "");
    const value = String(config.value || "");
    const allowed = ["displayName", "username", "email", "phone", "locale", "timezone"];
    if (allowed.includes(field)) {
      await db.contact.update({
        where: { id: input.contactId },
        data: { [field]: value },
      });
    }
  }

  await appendRunLog(input.runId, { step: input.step.order, type: input.step.type, completed: true });
  return { status: "completed" };
}

function evaluateCondition(input: {
  config: Record<string, unknown>;
  inboundText: string;
  contact: ConditionContact;
}) {
  const source = String(input.config.source || "inboundText");
  const operator = String(input.config.operator || "contains");
  const value = String(input.config.value || "");
  const values = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  function textMatches(text: string) {
    const normalizedText = text.toLowerCase();
    const candidates = values.length ? values : [value.trim()];
    if (operator === "equals") return candidates.some((item) => normalizedText.trim() === item.toLowerCase());
    if (operator === "not_contains") return candidates.every((item) => !normalizedText.includes(item.toLowerCase()));
    if (operator === "not_equals") return candidates.every((item) => normalizedText.trim() !== item.toLowerCase());
    return candidates.some((item) => normalizedText.includes(item.toLowerCase()));
  }

  if (source === "inboundText" || source === "commentText") {
    return textMatches(input.inboundText);
  }

  if (source === "tag") {
    const tagNames = input.contact?.tags.map((item) => item.tag.name) || [];
    const hasTag = tagNames.includes(value);
    return operator === "not_equals" ? !hasTag : hasTag;
  }

  if (source === "consentStatus") {
    const status = input.contact?.consentStatus || "unknown";
    return operator === "not_equals" ? status !== value : status === value;
  }

  return false;
}

export async function executeAutomation(input: {
  automation: AutomationWithSteps;
  contactId: string;
  conversationId: string;
  inboundText: string;
}) {
  const db = getDb();
  const run = await db.automationRun.create({
    data: {
      automationId: input.automation.id,
      contactId: input.contactId,
      conversationId: input.conversationId,
      status: "running",
      currentStep: 0,
      logsJson: [],
    },
  });

  return continueAutomationRun(run.id, input.inboundText);
}

export async function continueAutomationRun(runId: string, inboundText = "") {
  const db = getDb();
  const run = await db.automationRun.findUnique({
    where: { id: runId },
    include: { automation: { include: { steps: { orderBy: { order: "asc" } } } } },
  });

  if (!run || run.status !== "running") return run;

  try {
    let currentStep = run.currentStep;
    const steps = run.automation.steps;

    while (true) {
      const step = steps.find((item) => item.order > currentStep);
      if (!step) break;

      await db.automationRun.update({
        where: { id: run.id },
        data: { currentStep: step.order },
      });
      currentStep = step.order;

      const result = await runStep({
        runId: run.id,
        step,
        contactId: run.contactId,
        conversationId: run.conversationId,
        inboundText,
      });

      if (result.status === "paused") return run;
      if (result.status === "stop") break;
      if (result.status === "skip") {
        currentStep = result.nextOrder - 1;
        await db.automationRun.update({
          where: { id: run.id },
          data: { currentStep },
        });
      }
    }

    return db.automationRun.update({
      where: { id: run.id },
      data: { status: "completed" },
    });
  } catch (error) {
    await appendRunLog(run.id, {
      error: error instanceof Error ? error.message : "Unknown automation error",
    });
    return db.automationRun.update({
      where: { id: run.id },
      data: { status: "failed" },
    });
  }
}
