import OpenAI from "openai";
import type { AiProviderId } from "@/lib/ai/providers";
import {
  defaultModelForProvider,
  getProviderApiKey,
  getWorkspaceAiSetting,
  isModelApprovedForUse,
} from "@/lib/ai/providers";
import { getDb } from "@/lib/db";

export type KnowledgeCandidate = {
  id: string;
  title: string;
  content: string;
};

function tokenize(value: string) {
  const base = value
    .toLowerCase()
    .split(/[\s,，。！？、；：()[\]{}"'`]+/)
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
    return "我目前沒有找到足夠的知識庫內容可以回答這個問題，請留下你的問題，我們會由真人協助處理。";
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
    "你是 Instagram 私訊客服助理，請用自然、簡短、友善的繁體中文回答。",
    "請只根據知識庫內容回答；如果資料不足，請誠實說明並建議由真人協助。",
    prompt ? `額外回覆規則：${prompt}` : "",
    `知識庫內容：\n${context || "目前沒有可用的知識庫內容。"}`,
    `使用者問題：${question}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function cleanEnv(value: string | undefined) {
  const cleaned = String(value || "").trim();
  return cleaned || undefined;
}

function openAiBaseUrl(provider: AiProviderId) {
  if (provider === "deepseek") return "https://api.deepseek.com";
  if (provider === "xai") return "https://api.x.ai/v1";
  return undefined;
}

async function generateOpenAiCompatibleReply(input: {
  provider: AiProviderId;
  model: string;
  prompt: string;
  workspaceId?: string | null;
}) {
  const apiKey = cleanEnv(await getProviderApiKey(input.workspaceId, input.provider));
  if (!apiKey) return "";

  const baseURL = openAiBaseUrl(input.provider);
  const client = new OpenAI({
    apiKey,
    ...(baseURL ? { baseURL } : {}),
  });

  const completion = await client.chat.completions.create({
    model: input.model || defaultModelForProvider(input.provider),
    messages: [
      {
        role: "system",
        content: "你是 Instagram 私訊客服助理，請用繁體中文、簡短且貼近品牌語氣回答，只根據提供的知識庫內容回覆。",
      },
      { role: "user", content: input.prompt },
    ],
    temperature: 0.2,
  });

  return completion.choices[0]?.message.content?.trim() || "";
}

async function generateGeminiReply(input: { model: string; prompt: string; workspaceId?: string | null }) {
  const apiKey = cleanEnv(await getProviderApiKey(input.workspaceId, "gemini"));
  if (!apiKey) return "";

  const model = input.model || defaultModelForProvider("gemini");
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: input.prompt }] }],
        generationConfig: { temperature: 0.2 },
      }),
    },
  );

  if (!response.ok) return "";
  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim() || "";
}

export async function generateFaqReply(
  question: string,
  prompt?: string,
  workspaceId?: string | null,
  options?: { bypassApproval?: boolean },
) {
  const items = await getDb().knowledgeBaseItem.findMany({
    where: { enabled: true, ...(workspaceId ? { workspaceId } : {}) },
    orderBy: { updatedAt: "desc" },
  });
  if (process.env.NODE_ENV === "test" && process.env.AI_ENABLE_TEST_CALLS !== "true") {
    return fallbackFaqReply(question, items);
  }

  const aiSetting = await getWorkspaceAiSetting(workspaceId);
  if (!options?.bypassApproval && !(await isModelApprovedForUse(workspaceId, aiSetting.provider, aiSetting.model))) {
    return fallbackFaqReply(question, items);
  }

  const fullPrompt = buildFaqPrompt(question, items, prompt);

  if (aiSetting.provider === "codex_cli") {
    try {
      const { generateCodexCliReply } = await import("@/lib/ai/codex-cli");
      return (await generateCodexCliReply(fullPrompt, aiSetting.model)) || fallbackFaqReply(question, items);
    } catch {
      return fallbackFaqReply(question, items);
    }
  }

  if (aiSetting.provider === "antigravity_cli") {
    try {
      const { generateGeminiCliReply } = await import("@/lib/ai/gemini-cli");
      return (await generateGeminiCliReply(fullPrompt, aiSetting.model)) || fallbackFaqReply(question, items);
    } catch {
      return fallbackFaqReply(question, items);
    }
  }

  try {
    if (aiSetting.provider === "gemini") {
      return (
        (await generateGeminiReply({ model: aiSetting.model, prompt: fullPrompt, workspaceId })) ||
        fallbackFaqReply(question, items)
      );
    }

    return (
      (await generateOpenAiCompatibleReply({
        provider: aiSetting.provider,
        model: aiSetting.model,
        prompt: fullPrompt,
        workspaceId,
      })) || fallbackFaqReply(question, items)
    );
  } catch {
    return fallbackFaqReply(question, items);
  }
}
