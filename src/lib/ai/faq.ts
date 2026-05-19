import OpenAI from "openai";
import { getDb } from "@/lib/db";

export type KnowledgeCandidate = {
  id: string;
  title: string;
  content: string;
};

function tokenize(value: string) {
  const base = value
    .toLowerCase()
    .split(/[\s,，。.!！?？:：;；、()（）[\]{}"'`]+/)
    .map((item) => item.trim())
    .filter(Boolean);
  const cjkPairs = [...value]
    .map((_, index, chars) => chars.slice(index, index + 2).join(""))
    .filter((item) => item.length === 2 && /[\u4e00-\u9fff]/.test(item));

  return [...new Set([...base, ...cjkPairs])];
}

export function scoreKnowledgeItem(question: string, item: KnowledgeCandidate) {
  const terms = tokenize(question);
  const haystack = `${item.title} ${item.content}`.toLowerCase();
  return terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
}

export function pickBestKnowledgeItem(question: string, items: KnowledgeCandidate[]) {
  return [...items].sort(
    (a, b) => scoreKnowledgeItem(question, b) - scoreKnowledgeItem(question, a),
  )[0];
}

export function fallbackFaqReply(question: string, items: KnowledgeCandidate[]) {
  const best = pickBestKnowledgeItem(question, items);
  if (!best) {
    return "我目前沒有找到對應資料，你可以再補充一點問題細節，我會再幫你整理。";
  }

  const summary = best.content.length > 180 ? `${best.content.slice(0, 180)}...` : best.content;
  return `${best.title}：${summary}`;
}

function buildFaqPrompt(question: string, items: KnowledgeCandidate[], prompt?: string) {
  const context = items
    .slice(0, 8)
    .map((item) => `# ${item.title}\n${item.content}`)
    .join("\n\n");

  return [
    "你是自用訊息自動化工具的 FAQ 助理。",
    "只根據知識庫回答，不要編造平台政策或承諾。",
    "請用自然、簡短的繁體中文回答，直接輸出要回覆使用者的內容。",
    prompt ? `額外指示：${prompt}` : "",
    `知識庫：\n${context || "目前沒有知識庫資料。"}`,
    `使用者問題：${question}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function generateFaqReply(question: string, prompt?: string) {
  const items = await getDb().knowledgeBaseItem.findMany({
    where: { enabled: true },
    orderBy: { updatedAt: "desc" },
  });

  if (process.env.AI_PROVIDER === "codex_cli") {
    try {
      const { generateCodexCliReply } = await import("@/lib/ai/codex-cli");
      return (
        (await generateCodexCliReply(buildFaqPrompt(question, items, prompt))) ||
        fallbackFaqReply(question, items)
      );
    } catch {
      return fallbackFaqReply(question, items);
    }
  }

  if (!process.env.OPENAI_API_KEY) {
    return fallbackFaqReply(question, items);
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "你是自用訊息自動化工具的 FAQ 助理。只根據知識庫回答，不要編造平台政策或承諾。",
        },
        {
          role: "user",
          content: buildFaqPrompt(question, items, prompt),
        },
      ],
      temperature: 0.2,
    });

    return completion.choices[0]?.message.content?.trim() || fallbackFaqReply(question, items);
  } catch {
    return fallbackFaqReply(question, items);
  }
}
