import type { Prisma } from "@prisma/client";
import { getDb } from "@/lib/db";
import { encryptSecret, tryDecryptSecret } from "@/lib/secrets";

export type AiProviderId = "chatgpt" | "gemini" | "deepseek" | "xai" | "codex_cli" | "antigravity_cli";
export type LegacyAiProviderId = AiProviderId | "gemini_cli";
export type ReasoningEffort = "minimal" | "low" | "medium" | "high" | "xhigh";
export type ThinkingLevel = "none" | "low" | "medium" | "high";

export type AiModelOption = {
  id: string;
  label: string;
  intelligenceTier: "basic" | "standard" | "advanced" | "frontier";
  speedTier: "fast" | "balanced" | "slower";
  supportsReasoning: boolean;
  supportsThinking: boolean;
  reasoningEfforts?: ReasoningEffort[];
  thinkingLevels?: ThinkingLevel[];
  description?: string;
};

export const AI_PROVIDERS: Array<{ id: AiProviderId; label: string; kind: "api" | "cli" }> = [
  { id: "chatgpt", label: "ChatGPT", kind: "api" },
  { id: "gemini", label: "Gemini", kind: "api" },
  { id: "deepseek", label: "DeepSeek", kind: "api" },
  { id: "xai", label: "XAI", kind: "api" },
  { id: "codex_cli", label: "Codex CLI", kind: "cli" },
  { id: "antigravity_cli", label: "Antigravity CLI / Antigravity 2.0", kind: "cli" },
];

export const DEFAULT_MODELS: Record<AiProviderId, AiModelOption[]> = {
  chatgpt: [
    modelOption("gpt-5.2", "frontier", "balanced", true),
    modelOption("gpt-5.2-pro", "frontier", "slower", true),
    modelOption("gpt-5.2-codex", "frontier", "balanced", true),
    modelOption("gpt-5.1", "advanced", "balanced", true),
    modelOption("gpt-5.1-codex", "advanced", "balanced", true),
    modelOption("gpt-5.1-codex-max", "frontier", "slower", true),
    modelOption("gpt-5", "advanced", "balanced", true),
    modelOption("gpt-5-mini", "standard", "fast", true),
    modelOption("gpt-5-nano", "basic", "fast", true),
    modelOption("gpt-4.1", "advanced", "balanced", false),
    modelOption("gpt-4.1-mini", "standard", "fast", false),
    modelOption("gpt-4o", "advanced", "balanced", false),
    modelOption("gpt-4o-mini", "standard", "fast", false),
  ],
  gemini: [
    modelOption("gemini-3.5-flash", "advanced", "fast", false, true),
    modelOption("gemini-3.1-pro", "frontier", "slower", false, true),
    modelOption("gemini-3-flash", "advanced", "fast", false, true),
    modelOption("gemini-2.5-pro", "frontier", "slower", false, true),
    modelOption("gemini-2.5-flash", "advanced", "fast", false, true),
    modelOption("gemini-2.0-flash", "standard", "fast", false, false),
  ],
  deepseek: [
    modelOption("deepseek-v4-flash", "advanced", "fast", false),
    modelOption("deepseek-v4-pro", "frontier", "slower", true),
    modelOption("deepseek-chat", "standard", "balanced", false),
    modelOption("deepseek-reasoner", "advanced", "slower", true),
  ],
  xai: [
    modelOption("grok-4", "frontier", "balanced", true),
    modelOption("grok-4-fast", "advanced", "fast", true),
    modelOption("grok-3", "advanced", "balanced", false),
    modelOption("grok-3-mini", "standard", "fast", false),
  ],
  codex_cli: [
    modelOption("auto", "standard", "balanced", true),
    modelOption("gpt-5.2-codex", "frontier", "balanced", true),
    modelOption("gpt-5.1-codex-max", "frontier", "slower", true),
    modelOption("gpt-5.1-codex", "advanced", "balanced", true),
    modelOption("gpt-5-codex", "advanced", "balanced", true),
  ],
  antigravity_cli: [
    modelOption("auto", "frontier", "balanced", false, true),
    modelOption("gemini-3.5-flash", "advanced", "fast", false, true),
    modelOption("gemini-3.1-pro", "frontier", "slower", false, true),
    modelOption("gemini-3-flash", "advanced", "fast", false, true),
  ],
};

type WorkspaceAiSetting = {
  provider: AiProviderId;
  model: string;
  reasoningEffort: ReasoningEffort;
  thinkingLevel: ThinkingLevel;
};

function modelOption(
  id: string,
  intelligenceTier: AiModelOption["intelligenceTier"],
  speedTier: AiModelOption["speedTier"],
  supportsReasoning = false,
  supportsThinking = false,
  options?: Partial<Pick<AiModelOption, "label" | "reasoningEfforts" | "thinkingLevels" | "description">>,
): AiModelOption {
  return {
    id,
    label: options?.label || id,
    intelligenceTier,
    speedTier,
    supportsReasoning,
    supportsThinking,
    reasoningEfforts: options?.reasoningEfforts || (supportsReasoning ? ["low", "medium", "high"] : []),
    thinkingLevels: options?.thinkingLevels || (supportsThinking ? ["low", "medium", "high"] : []),
    description: options?.description || "",
  };
}

function cleanEnv(value: string | undefined) {
  const cleaned = String(value || "").trim();
  return cleaned || undefined;
}

export function normalizeProviderId(value: string): AiProviderId | null {
  if (value === "gemini_cli") return "antigravity_cli";
  return AI_PROVIDERS.some((provider) => provider.id === value) ? (value as AiProviderId) : null;
}

export function isAiProviderId(value: string): value is AiProviderId {
  return Boolean(normalizeProviderId(value));
}

export function getAiProviderMeta(provider: AiProviderId) {
  return AI_PROVIDERS.find((item) => item.id === provider);
}

export function isApiAiProvider(provider: AiProviderId) {
  return getAiProviderMeta(provider)?.kind === "api";
}

export function isLocalAiCliEnabled() {
  const override = process.env.AI_ENABLE_LOCAL_CLI?.trim().toLowerCase();
  if (override) return ["1", "true", "yes", "on"].includes(override);

  return process.env.NODE_ENV === "development" && process.env.VERCEL !== "1";
}

export function canUseAiProvider(provider: AiProviderId) {
  const meta = getAiProviderMeta(provider);
  if (!meta) return false;
  if (meta.kind === "api") return true;
  return isLocalAiCliEnabled();
}

export function defaultModelForProvider(provider: AiProviderId) {
  return DEFAULT_MODELS[provider][0]?.id || "auto";
}

export function defaultProvider(): AiProviderId {
  return "chatgpt";
}

export async function getWorkspaceAiSetting(workspaceId?: string | null): Promise<WorkspaceAiSetting> {
  const provider = defaultProvider();
  if (!workspaceId) {
    return { provider, model: defaultModelForProvider(provider), reasoningEffort: "medium", thinkingLevel: "medium" };
  }

  const setting = await getDb().workspaceAiSetting.findUnique({ where: { workspaceId } });
  const normalized = setting ? normalizeProviderId(setting.provider) : null;
  if (!setting || !normalized || !canUseAiProvider(normalized)) {
    return { provider, model: defaultModelForProvider(provider), reasoningEffort: "medium", thinkingLevel: "medium" };
  }

  return {
    provider: normalized,
    model: setting.model || defaultModelForProvider(normalized),
    reasoningEffort: isReasoningEffort(setting.reasoningEffort) ? setting.reasoningEffort : "medium",
    thinkingLevel: isThinkingLevel(setting.thinkingLevel) ? setting.thinkingLevel : "medium",
  };
}

export async function saveWorkspaceAiSetting(input: {
  workspaceId: string;
  provider: AiProviderId;
  model: string;
  reasoningEffort?: ReasoningEffort;
  thinkingLevel?: ThinkingLevel;
}) {
  return getDb().workspaceAiSetting.upsert({
    where: { workspaceId: input.workspaceId },
    update: {
      provider: input.provider,
      model: input.model,
      reasoningEffort: input.reasoningEffort || "medium",
      thinkingLevel: input.thinkingLevel || "medium",
    },
    create: {
      workspaceId: input.workspaceId,
      provider: input.provider,
      model: input.model,
      reasoningEffort: input.reasoningEffort || "medium",
      thinkingLevel: input.thinkingLevel || "medium",
    },
  });
}

function isReasoningEffort(value: unknown): value is ReasoningEffort {
  return value === "minimal" || value === "low" || value === "medium" || value === "high" || value === "xhigh";
}

function isThinkingLevel(value: unknown): value is ThinkingLevel {
  return value === "none" || value === "low" || value === "medium" || value === "high";
}

export async function saveProviderApiKey(input: { workspaceId: string; provider: AiProviderId; apiKey: string }) {
  const encryptedApiKey = input.apiKey.trim() ? encryptSecret(input.apiKey.trim()) : null;
  return getDb().workspaceAiCredential.upsert({
    where: { workspaceId_provider: { workspaceId: input.workspaceId, provider: input.provider } },
    update: { encryptedApiKey, testStatus: encryptedApiKey ? "untested" : "missing", testError: null },
    create: {
      workspaceId: input.workspaceId,
      provider: input.provider,
      encryptedApiKey,
      testStatus: encryptedApiKey ? "untested" : "missing",
    },
  });
}

export async function getProviderApiKey(workspaceId: string | null | undefined, provider: AiProviderId) {
  if (workspaceId) {
    const credential = await getDb().workspaceAiCredential.findUnique({
      where: { workspaceId_provider: { workspaceId, provider } },
    });
    if (credential?.encryptedApiKey) {
      return tryDecryptSecret(credential.encryptedApiKey) || "";
    }
  }

  return "";
}

export async function getCredentialsStatus(workspaceId: string) {
  const credentials = await getDb().workspaceAiCredential.findMany({ where: { workspaceId } });
  const localCliEnabled = isLocalAiCliEnabled();
  return Object.fromEntries(
    AI_PROVIDERS.map((provider) => {
      const credential = credentials.find((item) => item.provider === provider.id);
      const cliConfigured = provider.kind === "cli" && localCliEnabled;
      let hasUsableKey = false;
      let keyError = "";
      if (credential?.encryptedApiKey) {
        const decryptedKey = tryDecryptSecret(credential.encryptedApiKey);
        if (decryptedKey) {
          hasUsableKey = true;
        } else {
          keyError = "API Key 無法解密，請重新儲存。";
        }
      }

      return [
        provider.id,
        {
          hasStoredKey: hasUsableKey,
          configured: provider.kind === "api" ? hasUsableKey : cliConfigured,
          testStatus: keyError
            ? "invalid"
            : credential?.testStatus || (provider.kind === "cli" ? (localCliEnabled ? "local" : "development") : "missing"),
          testError: keyError || credential?.testError || "",
          testedModel: credential?.testedModel || "",
          lastTestedAt: credential?.lastTestedAt?.toISOString() || "",
        },
      ];
    }),
  );
}

async function fetchJson(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: { accept: "application/json", ...(init?.headers || {}) },
  });
  if (!response.ok) throw new Error(`Model list request failed: ${response.status}`);
  return response.json() as Promise<unknown>;
}

function classifyModel(provider: AiProviderId, id: string): AiModelOption {
  const lower = id.toLowerCase();
  const supportsReasoning = /reason|r1|o\d|gpt-5|grok-4|pro|max|codex/.test(lower);
  const supportsThinking = provider === "gemini" || provider === "antigravity_cli";
  const speedTier: AiModelOption["speedTier"] =
    /nano|mini|flash|fast|lite/.test(lower) ? "fast" : /pro|max|reason|r1/.test(lower) ? "slower" : "balanced";
  const intelligenceTier: AiModelOption["intelligenceTier"] =
    /5\.2|4|3\.5|pro|max|frontier|opus/.test(lower)
      ? "frontier"
      : /5|3|2\.5|reason|r1|grok|codex/.test(lower)
        ? "advanced"
        : /mini|flash|turbo/.test(lower)
          ? "standard"
          : "basic";
  return modelOption(id, intelligenceTier, speedTier, supportsReasoning, supportsThinking);
}

function asReasoningEffort(value: unknown): ReasoningEffort | null {
  return isReasoningEffort(value) ? value : null;
}

async function readCodexCliModelsFromCache() {
  const { readFile } = await import("fs/promises");
  const { homedir } = await import("os");
  const { join } = await import("path");
  const cachePath = join(homedir(), ".codex", "models_cache.json");
  const data = JSON.parse(await readFile(cachePath, "utf8")) as {
    models?: Array<{
      slug?: string;
      display_name?: string;
      description?: string;
      visibility?: string;
      priority?: number;
      supported_reasoning_levels?: Array<{ effort?: string }>;
      additional_speed_tiers?: string[];
      service_tiers?: Array<{ id?: string; name?: string }>;
    }>;
  };

  return (data.models || [])
    .filter((model) => model.slug && model.visibility !== "hidden")
    .map((model) => {
      const reasoningEfforts = (model.supported_reasoning_levels || [])
        .map((level) => asReasoningEffort(level.effort))
        .filter((level): level is ReasoningEffort => Boolean(level));
      const priority = Number(model.priority || 0);
      const speedTier = model.additional_speed_tiers?.includes("fast")
        ? "fast"
        : priority >= 8
          ? "balanced"
          : "slower";
      const intelligenceTier =
        priority >= 9 ? "frontier" : priority >= 7 ? "advanced" : priority >= 5 ? "standard" : "basic";

      return modelOption(model.slug!, intelligenceTier, speedTier, reasoningEfforts.length > 0, false, {
        label: model.display_name || model.slug,
        reasoningEfforts,
        description: [
          model.description || "",
          model.service_tiers?.length ? `Service tiers: ${model.service_tiers.map((tier) => tier.name || tier.id).join(", ")}` : "",
        ].filter(Boolean).join(" "),
      });
    });
}

async function findGeminiCliBundleFile() {
  const { readFile, readdir } = await import("fs/promises");
  const { join } = await import("path");
  const systemDrive = process.env.SystemDrive || "C:";
  const globalNodeModules = [
    systemDrive,
    "nvm4w",
    "nodejs",
    "node_modules",
    "@google",
    "gemini-cli",
    "bundle",
  ].join("\\");
  const candidates = [
    cleanEnv(process.env.GEMINI_CLI_BUNDLE_DIR) || cleanEnv(process.env.ANTIGRAVITY_CLI_BUNDLE_DIR) || "",
    globalNodeModules,
    join(process.env.APPDATA || "", "npm", "node_modules", "@google", "gemini-cli", "bundle"),
  ].filter(Boolean);

  for (const directory of candidates) {
    try {
      const files = await readdir(directory);
      for (const file of files.filter((item) => item.endsWith(".js"))) {
        const fullPath = join(directory, file);
        const content = await readFile(fullPath, "utf8");
        if (content.includes("var DEFAULT_MODEL_CONFIGS") && content.includes("modelDefinitions")) {
          return content;
        }
      }
    } catch {
      // Try the next installed Gemini CLI location.
    }
  }

  return "";
}

function extractGeminiCliModelDefinitions(bundle: string) {
  const start = bundle.indexOf("modelDefinitions: {");
  const end = bundle.indexOf("\n  modelIdResolutions:", start);
  if (start < 0 || end < 0) return [];

  const block = bundle.slice(start, end);
  const modelIds = [...block.matchAll(/"([^"]+)":\s*\{/g)]
    .map((match) => match[1])
    .filter((id) => /^(auto|pro|flash|gemini-|gemma-)/.test(id));

  return [...new Set(modelIds)].map((id) => {
    const entryStart = block.indexOf(`"${id}":`);
    const nextEntryMatch = block.slice(entryStart + id.length + 4).match(/\n    "([^"]+)":\s*\{/);
    const entryEnd = nextEntryMatch?.index ? entryStart + id.length + 4 + nextEntryMatch.index : block.length;
    const entry = block.slice(entryStart, entryEnd);
    const visible = !/isVisible:\s*false/.test(entry);
    const thinking = /features:\s*\{[^}]*thinking:\s*true/.test(entry);
    const tier = entry.match(/tier:\s*"([^"]+)"/)?.[1] || "";
    const displayName = entry.match(/displayName:\s*"([^"]+)"/)?.[1] || id;
    const description = entry.match(/dialogDescription:\s*"([^"]+)"/)?.[1] || "";

    return { id, visible, thinking, tier, displayName, description };
  }).filter((model) => model.visible);
}

async function readGeminiCliModelsFromBundle() {
  const bundle = await findGeminiCliBundleFile();
  if (!bundle) return [];

  return extractGeminiCliModelDefinitions(bundle).map((model) => {
    const speedTier: AiModelOption["speedTier"] =
      model.tier === "flash" || model.tier === "flash-lite" ? "fast" : model.tier === "pro" ? "slower" : "balanced";
    const intelligenceTier: AiModelOption["intelligenceTier"] =
      model.tier === "pro" || model.id.includes("3.1") || model.id.includes("3-pro")
        ? "frontier"
        : model.tier === "flash" || model.id.includes("3")
          ? "advanced"
          : model.tier === "flash-lite"
            ? "standard"
            : "basic";

    return modelOption(model.id, intelligenceTier, speedTier, false, model.thinking, {
      label: model.displayName,
      thinkingLevels: model.thinking ? ["low", "medium", "high"] : [],
      description: model.description || `Gemini CLI tier: ${model.tier || "unknown"}`,
    });
  });
}

function parseOpenAiCompatibleModels(provider: AiProviderId, value: unknown, matcher: RegExp) {
  const blocked = /image|audio|tts|transcribe|realtime|embedding|moderation|search|babbage|davinci/i;
  const data = (value as { data?: Array<{ id?: string }> }).data || [];
  return data
    .map((model) => model.id)
    .filter((id): id is string => Boolean(id))
    .filter((id) => matcher.test(id))
    .filter((id) => !blocked.test(id))
    .sort()
    .map((id) => classifyModel(provider, id));
}

function parseGeminiModels(value: unknown) {
  const models = (value as { models?: Array<{ name?: string; supportedGenerationMethods?: string[] }> }).models || [];
  return models
    .filter((model) => model.supportedGenerationMethods?.includes("generateContent"))
    .map((model) => model.name?.replace(/^models\//, ""))
    .filter((id): id is string => Boolean(id))
    .sort()
    .map((id) => classifyModel("gemini", id));
}

async function runCli(args: string[], command: string, timeoutMs: number) {
  const { spawn } = await import("child_process");
  return new Promise<string>((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    const chunks: Buffer[] = [];
    const errors: Buffer[] = [];
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error(`${command} models timed out.`));
    }, timeoutMs);

    child.stdout.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    child.stderr.on("data", (chunk) => errors.push(Buffer.from(chunk)));
    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on("exit", (code) => {
      clearTimeout(timeout);
      if (code === 0) resolve(Buffer.concat(chunks).toString("utf8"));
      else reject(new Error(Buffer.concat(errors).toString("utf8") || `${command} exited with ${code}`));
    });
  });
}

function parseCliModelOutput(provider: AiProviderId, output: string) {
  const candidates = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .flatMap((line) => line.split(/\s+/))
    .map((value) => value.replace(/[,;]/g, ""))
    .filter((value) => /^[a-z0-9][a-z0-9._:-]+$/i.test(value))
    .filter((value) => /gpt|codex|gemini|deepseek|grok|antigravity/i.test(value));

  return [...new Set(candidates)].map((id) => classifyModel(provider, id));
}

async function fetchProviderModels(provider: AiProviderId, workspaceId?: string | null) {
  if (provider === "chatgpt") {
    const key = await getProviderApiKey(workspaceId, provider);
    if (!key) return DEFAULT_MODELS[provider];
    const models = parseOpenAiCompatibleModels(
      provider,
      await fetchJson("https://api.openai.com/v1/models", { headers: { authorization: `Bearer ${key}` } }),
      /^(gpt|o\d|chatgpt)/i,
    );
    return mergeDefaults(provider, models);
  }

  if (provider === "gemini") {
    const key = await getProviderApiKey(workspaceId, provider);
    if (!key) return DEFAULT_MODELS[provider];
    const models = parseGeminiModels(
      await fetchJson(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`),
    );
    return mergeDefaults(provider, models);
  }

  if (provider === "deepseek") {
    const key = await getProviderApiKey(workspaceId, provider);
    if (!key) return DEFAULT_MODELS[provider];
    const models = parseOpenAiCompatibleModels(
      provider,
      await fetchJson("https://api.deepseek.com/models", { headers: { authorization: `Bearer ${key}` } }),
      /^deepseek/i,
    );
    return mergeDefaults(provider, models);
  }

  if (provider === "xai") {
    const key = await getProviderApiKey(workspaceId, provider);
    if (!key) return DEFAULT_MODELS[provider];
    const models = parseOpenAiCompatibleModels(
      provider,
      await fetchJson("https://api.x.ai/v1/models", { headers: { authorization: `Bearer ${key}` } }),
      /^(grok|xai)/i,
    );
    return mergeDefaults(provider, models);
  }

  if (provider === "codex_cli") {
    const cachedModels = await readCodexCliModelsFromCache().catch(() => []);
    if (cachedModels.length) return mergeDefaults(provider, cachedModels);

    const output = await runCli(["--help"], cleanEnv(process.env.CODEX_CLI_COMMAND) || "codex", 8000);
    return mergeDefaults(provider, parseCliModelOutput(provider, output));
  }

  const bundledModels = await readGeminiCliModelsFromBundle().catch(() => []);
  if (bundledModels.length) return mergeDefaults(provider, bundledModels);

  const output = await runCli(
    ["--help"],
    cleanEnv(process.env.ANTIGRAVITY_CLI_COMMAND) || cleanEnv(process.env.GEMINI_CLI_COMMAND) || "gemini",
    8000,
  );
  return mergeDefaults(provider, parseCliModelOutput(provider, output));
}

function mergeDefaults(provider: AiProviderId, models: AiModelOption[]) {
  const map = new Map<string, AiModelOption>();
  for (const model of DEFAULT_MODELS[provider]) map.set(model.id, model);
  for (const model of models) map.set(model.id, model);
  return [...map.values()];
}

export async function refreshAiModels(provider: AiProviderId, workspaceId?: string | null) {
  const db = getDb();
  let models = DEFAULT_MODELS[provider];
  try {
    models = await fetchProviderModels(provider, workspaceId);
  } catch {
    models = DEFAULT_MODELS[provider];
  }

  for (const model of models) {
    await db.aiModelCache.upsert({
      where: { provider_modelId: { provider, modelId: model.id } },
      update: toModelCacheData(model),
      create: { provider, modelId: model.id, ...toModelCacheData(model) },
    });
  }
  return models;
}

function toModelCacheData(model: AiModelOption) {
  return {
    label: model.label,
    intelligenceTier: model.intelligenceTier,
    speedTier: model.speedTier,
    supportsReasoning: model.supportsReasoning,
    supportsThinking: model.supportsThinking,
    enabled: true,
    rawJson: model as unknown as Prisma.InputJsonValue,
    fetchedAt: new Date(),
  };
}

export async function refreshAllAiModels(workspaceId?: string | null) {
  const result: Record<string, number> = {};
  for (const provider of AI_PROVIDERS) {
    result[provider.id] = (await refreshAiModels(provider.id, workspaceId)).length;
  }
  return result;
}

export async function listAiModels(provider: AiProviderId, workspaceId?: string | null) {
  const db = getDb();
  const cached = await db.aiModelCache.findMany({
    where: { provider, enabled: true },
    orderBy: [{ intelligenceTier: "desc" }, { speedTier: "asc" }, { modelId: "asc" }],
  });
  if (cached.length) {
    return cached.map((model) => ({
      id: model.modelId,
      label: model.label,
      intelligenceTier: model.intelligenceTier as AiModelOption["intelligenceTier"],
      speedTier: model.speedTier as AiModelOption["speedTier"],
      supportsReasoning: model.supportsReasoning,
      supportsThinking: model.supportsThinking,
      reasoningEfforts: (model.rawJson as { reasoningEfforts?: ReasoningEffort[] } | null)?.reasoningEfforts || [],
      thinkingLevels: (model.rawJson as { thinkingLevels?: ThinkingLevel[] } | null)?.thinkingLevels || [],
      description: (model.rawJson as { description?: string } | null)?.description || "",
    }));
  }
  return refreshAiModels(provider, workspaceId);
}

export async function markProviderTestResult(input: {
  workspaceId: string;
  provider: AiProviderId;
  model: string;
  ok: boolean;
  error?: string;
}) {
  return getDb().workspaceAiCredential.upsert({
    where: { workspaceId_provider: { workspaceId: input.workspaceId, provider: input.provider } },
    update: {
      testStatus: input.ok ? "passed" : "failed",
      testError: input.ok ? null : input.error || "模型測試失敗。",
      testedModel: input.model,
      lastTestedAt: new Date(),
    },
    create: {
      workspaceId: input.workspaceId,
      provider: input.provider,
      testStatus: input.ok ? "passed" : "failed",
      testError: input.ok ? null : input.error || "模型測試失敗。",
      testedModel: input.model,
      lastTestedAt: new Date(),
    },
  });
}

export async function isModelApprovedForUse(workspaceId: string | null | undefined, provider: AiProviderId, model: string) {
  if (process.env.AI_ALLOW_UNTESTED_MODELS === "true") return true;
  if (!workspaceId) return false;

  const credential = await getDb().workspaceAiCredential.findUnique({
    where: { workspaceId_provider: { workspaceId, provider } },
  });

  return credential?.testStatus === "passed" && credential.testedModel === model;
}
