import type { Automation, AutomationStep, Prisma } from "@prisma/client";
import { generateFaqReply } from "@/lib/ai/faq";
import { getDb } from "@/lib/db";
import { sendOutboundMessage } from "@/lib/messages";

type AutomationWithSteps = Automation & { steps: AutomationStep[] };

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
}) {
  const db = getDb();
  const config = asRecord(input.step.configJson);

  if (input.step.type === "send_message") {
    const text = interpolate(String(config.text || ""));
    if (text) await sendOutboundMessage(input.conversationId, text);
  }

  if (input.step.type === "add_tag") {
    const tagName = String(config.tagName || "");
    const tagId = String(config.tagId || "");
    const tag = tagId
      ? await db.tag.findUnique({ where: { id: tagId } })
      : tagName
        ? await db.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName, color: "#2563eb" },
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
        ? await db.tag.findUnique({ where: { name: tagName } })
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
        type: "automation_continue",
        status: "queued",
        runAt: new Date(Date.now() + seconds * 1000),
        payloadJson: { runId: input.runId },
      },
    });
    await appendRunLog(input.runId, { step: input.step.order, type: input.step.type, queued: true });
    return "paused";
  }

  if (input.step.type === "ai_reply") {
    const reply = await generateFaqReply(input.inboundText, String(config.prompt || ""));
    await sendOutboundMessage(input.conversationId, reply);
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
  return "completed";
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
    for (const step of run.automation.steps.filter((item) => item.order > run.currentStep)) {
      await db.automationRun.update({
        where: { id: run.id },
        data: { currentStep: step.order },
      });

      const result = await runStep({
        runId: run.id,
        step,
        contactId: run.contactId,
        conversationId: run.conversationId,
        inboundText,
      });

      if (result === "paused") return run;
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
