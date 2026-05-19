import { getDb } from "@/lib/db";
import { executeAutomation } from "@/lib/automation/engine";

export function keywordMatches(text: string, config: unknown) {
  const value = String(text || "").toLowerCase();
  const parsed = (config || {}) as { keywords?: string[]; keyword?: string; match?: string };
  const keywords = parsed.keywords?.length ? parsed.keywords : parsed.keyword ? [parsed.keyword] : [];
  const match = parsed.match || "contains";

  return keywords.some((keyword) => {
    const normalized = keyword.toLowerCase();
    if (match === "exact") return value.trim() === normalized.trim();
    return value.includes(normalized);
  });
}

export async function runKeywordAutomations(input: {
  contactId: string;
  conversationId: string;
  text: string;
}) {
  const automations = await getDb().automation.findMany({
    where: { enabled: true, triggerType: "keyword" },
    include: { steps: { orderBy: { order: "asc" } } },
  });

  const matched = automations.filter((automation) =>
    keywordMatches(input.text, automation.triggerConfigJson),
  );

  for (const automation of matched) {
    await executeAutomation({
      automation,
      contactId: input.contactId,
      conversationId: input.conversationId,
      inboundText: input.text,
    });
  }

  return matched.length;
}
