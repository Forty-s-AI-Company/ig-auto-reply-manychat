"use client";

import {
  ArrowRight,
  Bot,
  Cable,
  CheckCircle2,
  KeyRound,
  RefreshCw,
  Save,
  ShieldCheck,
  Terminal,
  TestTube2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { DismissibleNoticeToast } from "@/components/DismissibleNoticeToast";
import { ManualActionNotice } from "@/components/ManualActionNotice";

type ProviderId = "chatgpt" | "gemini" | "deepseek" | "xai" | "codex_cli" | "antigravity_cli";
type ReasoningEffort = "minimal" | "low" | "medium" | "high" | "xhigh";
type ThinkingLevel = "none" | "low" | "medium" | "high";

type ProviderOption = {
  id: ProviderId;
  label: string;
  kind: "api" | "cli";
};

type ModelOption = {
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

type CredentialStatus = {
  hasStoredKey: boolean;
  configured: boolean;
  testStatus: string;
  testError: string;
  testedModel: string;
  lastTestedAt: string;
};

type InitialState = {
  setting: {
    provider: ProviderId;
    model: string;
    reasoningEffort: ReasoningEffort;
    thinkingLevel: ThinkingLevel;
  };
  providers: ProviderOption[];
  credentials: Record<string, CredentialStatus>;
  initialModels: ModelOption[];
  localCliEnabled: boolean;
};

const intelligenceLabels: Record<ModelOption["intelligenceTier"], string> = {
  basic: "基礎",
  standard: "標準",
  advanced: "高智慧",
  frontier: "前沿",
};

const speedLabels: Record<ModelOption["speedTier"], string> = {
  fast: "快速",
  balanced: "平衡",
  slower: "較慢",
};

const statusLabels: Record<string, string> = {
  missing: "尚未設定",
  untested: "尚未測試",
  passed: "測試通過",
  failed: "測試失敗",
  invalid: "Key 無法解密",
  development: "本機橋接",
  local: "本機可用",
};

const cliConnectionCards = [
  {
    id: "codex_cli",
    title: "Codex 連接方式",
    badge: "建議用 OpenAI API",
    provider: "chatgpt" as ProviderId,
    preferredModel: "gpt-5.2-codex",
    button: "改用 ChatGPT API 連接 Codex 模型",
    body:
      "正式 SaaS 不能讀取使用者電腦裡已登入的 Codex CLI，所以不能直接把本機 Codex 當成多人共用服務。請在 ChatGPT 供應商填入 OpenAI API Key，模型選 gpt-5.2-codex 或其他 Codex 模型。",
    local:
      "自架或本機開發時，可以在執行 InboxPilot 的同一台機器安裝並登入 Codex CLI，再用本機橋接模式呼叫。",
    commands: ["codex login", "CODEX_CLI_COMMAND=codex"],
  },
  {
    id: "antigravity_cli",
    title: "Antigravity 連接方式",
    badge: "建議用 Gemini API",
    provider: "gemini" as ProviderId,
    preferredModel: "gemini-3.5-flash",
    button: "改用 Gemini API 連接 Antigravity 模型",
    body:
      "Antigravity CLI 也屬於本機登入狀態，不適合由雲端 SaaS 直接代替使用者執行。正式站請在 Gemini 供應商填入 Gemini API Key，再選支援 Thinking 的 Gemini 模型。",
    local:
      "自架或本機開發時，可以在伺服器安裝 Antigravity / Gemini CLI，確認同一個執行帳號已登入後再啟用橋接。",
    commands: ["gemini auth login", "ANTIGRAVITY_CLI_COMMAND=gemini"],
  },
];

function providerLabel(provider: ProviderOption) {
  if (provider.kind === "cli") return `${provider.label}（本機橋接）`;
  return provider.label;
}

const lightFieldClass = "w-full rounded-md border border-[#cfd4dc] bg-white px-3 py-2 text-[#111827] shadow-sm outline-none focus:border-[#006fe6] focus:ring-2 focus:ring-[#dbeafe] disabled:bg-[#eef0f2] disabled:text-[#667085]";
const secondaryButtonClass = "rounded-md border border-[#cfd4dc] bg-white px-3 py-2 text-sm font-medium text-[#344054] hover:bg-[#f8fafc] disabled:border-[#d7dbe0] disabled:bg-[#f3f4f6] disabled:text-[#667085]";

function statusLabel(status?: string) {
  return statusLabels[status || ""] || status || "尚未測試";
}

export function AiSettingsClient({ initialState }: { initialState: InitialState }) {
  const [provider, setProvider] = useState<ProviderId>(initialState.setting.provider);
  const [model, setModel] = useState(
    initialState.initialModels.some((item) => item.id === initialState.setting.model)
      ? initialState.setting.model
      : initialState.initialModels[0]?.id || initialState.setting.model,
  );
  const [reasoningEffort, setReasoningEffort] = useState(initialState.setting.reasoningEffort);
  const [thinkingLevel, setThinkingLevel] = useState(initialState.setting.thinkingLevel);
  const [apiKey, setApiKey] = useState("");
  const [models, setModels] = useState(initialState.initialModels);
  const [credentials, setCredentials] = useState(initialState.credentials);
  const [loadingModels, setLoadingModels] = useState(false);
  const [refreshingModels, setRefreshingModels] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState("");

  const activeProvider = useMemo(
    () => initialState.providers.find((item) => item.id === provider),
    [initialState.providers, provider],
  );
  const activeModel = useMemo(() => models.find((item) => item.id === model), [models, model]);
  const activeCredential = credentials[provider];
  const apiProviders = initialState.providers.filter((item) => item.kind === "api");
  const availableProviders = initialState.localCliEnabled ? initialState.providers : apiProviders;
  const reasoningOptions = activeModel?.reasoningEfforts?.length
    ? activeModel.reasoningEfforts
    : activeModel?.supportsReasoning
      ? (["low", "medium", "high"] satisfies ReasoningEffort[])
      : ([] as ReasoningEffort[]);
  const thinkingOptions = activeModel?.thinkingLevels?.length
    ? activeModel.thinkingLevels
    : activeModel?.supportsThinking
      ? (["low", "medium", "high"] satisfies ThinkingLevel[])
      : ([] as ThinkingLevel[]);
  const showReasoningControl = reasoningOptions.length > 0;
  const showThinkingControl = thinkingOptions.length > 0;
  const effectiveReasoningEffort = showReasoningControl && reasoningOptions.includes(reasoningEffort)
    ? reasoningEffort
    : reasoningOptions[0] || "medium";
  const effectiveThinkingLevel = showThinkingControl && thinkingOptions.includes(thinkingLevel)
    ? thinkingLevel
    : thinkingOptions[0] || "none";
  const isApiProvider = activeProvider?.kind === "api";
  const isLocalCliProvider = activeProvider?.kind === "cli" && initialState.localCliEnabled;
  const canSaveSetting = Boolean(isApiProvider || isLocalCliProvider);
  const canTestModel = isApiProvider ? Boolean(activeCredential?.configured) : isLocalCliProvider;

  async function loadModels(nextProvider: ProviderId, preferredModel?: string) {
    setLoadingModels(true);
    setMessage("");
    try {
      const response = await fetch(`/api/ai-models?provider=${encodeURIComponent(nextProvider)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "讀取模型清單失敗。");

      const nextModels = Array.isArray(data.models) ? data.models : [];
      setModels(nextModels);
      const targetModel = preferredModel || model;
      const exists = nextModels.some((item: ModelOption) => item.id === targetModel);
      setModel(exists ? targetModel : nextModels[0]?.id || "auto");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "讀取模型清單失敗。");
    } finally {
      setLoadingModels(false);
    }
  }

  async function handleProviderChange(nextProvider: ProviderId) {
    const nextMeta = initialState.providers.find((item) => item.id === nextProvider);
    if (nextMeta?.kind === "cli" && !initialState.localCliEnabled) {
      setMessage("Codex / Antigravity 需要透過下方連接方式啟用，正式 SaaS 請改用 API Key 連接。");
      return;
    }

    setProvider(nextProvider);
    setApiKey("");
    await loadModels(nextProvider);
  }

  async function applyConnectionPreset(nextProvider: ProviderId, preferredModel: string) {
    setProvider(nextProvider);
    setApiKey("");
    await loadModels(nextProvider, preferredModel);
    setMessage("已切換到建議供應商。請填入這個帳號自己的 API Key，儲存後即可測試模型。");
  }

  async function refreshModels() {
    if (!canSaveSetting) {
      setMessage("正式 SaaS 不會直接執行本機 CLI；請使用下方連接方式改用 API Key。");
      return;
    }
    if (isApiProvider && !activeCredential?.configured) {
      setMessage("請先加密儲存這個供應商的 API Key，再抓取最新模型清單。");
      return;
    }
    setRefreshingModels(true);
    setMessage("");
    try {
      const response = await fetch("/api/ai-models/refresh", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "更新模型清單失敗。");
      setModels(Array.isArray(data.models) ? data.models : []);
      setMessage(`已更新 ${activeProvider?.label || provider} 模型清單，共 ${data.count || 0} 筆。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "更新模型清單失敗。");
    } finally {
      setRefreshingModels(false);
    }
  }

  async function saveSetting() {
    if (!canSaveSetting) {
      setMessage("正式 SaaS 只能儲存 API 型 AI 供應商；CLI 請使用下方連接方式。");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/ai-settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          provider,
          model,
          reasoningEffort: effectiveReasoningEffort,
          thinkingLevel: effectiveThinkingLevel,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "儲存 AI 設定失敗。");
      setMessage("AI 設定已儲存。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "儲存 AI 設定失敗。");
    } finally {
      setSaving(false);
    }
  }

  async function saveApiKey() {
    if (!isApiProvider) {
      setMessage("CLI 模式不接受 API Key 儲存，請改用 ChatGPT / Gemini / DeepSeek / XAI。");
      return;
    }
    setSavingKey(true);
    setMessage("");
    try {
      const response = await fetch("/api/ai-settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ provider, apiKey }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "儲存 API Key 失敗。");
      setCredentials(data.credentials);
      setApiKey("");
      setMessage(apiKey.trim() ? "API Key 已加密儲存。" : "已清除這個供應商的 API Key。");
      await loadModels(provider, model);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "儲存 API Key 失敗。");
    } finally {
      setSavingKey(false);
    }
  }

  async function testModel() {
    setTesting(true);
    setMessage("");
    try {
      const response = await fetch("/api/ai-model-test", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          provider,
          model,
          reasoningEffort: effectiveReasoningEffort,
          thinkingLevel: effectiveThinkingLevel,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "模型測試失敗。");
      setMessage(`模型測試通過：${String(data.reply || "").slice(0, 80)}`);
      const settings = await fetch("/api/ai-settings");
      if (settings.ok) setCredentials((await settings.json()).credentials);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "模型測試失敗。");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="space-y-6 text-[#111827]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-semibold">
            <Bot className="h-6 w-6 text-[#00b8d9]" />
            AI 模型設定
          </h2>
          <p className="mt-1 text-sm text-[#667085]">
            設定 AI 供應商、模型、API Key、智慧程度與思考程度。每個帳號的 API Key 會加密存放在資料庫，不會從伺服器 .env 帶入。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={testing || loadingModels || !canTestModel}
            onClick={testModel}
            title={canTestModel ? "測試目前模型" : "請先加密儲存這個供應商的 API Key"}
            className="flex items-center gap-2 rounded-md border border-[#00b8d9] bg-white px-4 py-2 text-sm font-medium text-[#006d85] hover:bg-[#ecfeff] disabled:border-[#d7dbe0] disabled:bg-[#f3f4f6] disabled:text-[#667085]"
          >
            <TestTube2 className="h-4 w-4" />
            {testing ? "測試中..." : "測試模型"}
          </button>
          <button
            type="button"
            disabled={saving || loadingModels || !canSaveSetting}
            onClick={saveSetting}
            className="flex items-center gap-2 rounded-md bg-[#00b8d9] px-4 py-2 text-sm font-medium text-[#111827] hover:bg-[#0098b8] disabled:bg-[#d7dbe0] disabled:text-[#667085]"
          >
            <Save className="h-4 w-4" />
            {saving ? "儲存中..." : "儲存設定"}
          </button>
        </div>
      </div>

      {message ? (
        <DismissibleNoticeToast key={message} title="AI 設定提醒" tone="info">
          {message}
        </DismissibleNoticeToast>
      ) : null}

      <ManualActionNotice title="SaaS 連接方式：API Key" tone="cyan" stackIndex={message ? 1 : 0}>
        <p>
          ChatGPT、Gemini、DeepSeek、XAI 由目前帳號自行填入 API Key。正式站只顯示雲端 SaaS 可直接使用的 API 供應商。
          {initialState.localCliEnabled ? " 目前偵測為本機模式，已開放 CLI 橋接工具。" : ""}
        </p>
      </ManualActionNotice>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5 rounded-lg border border-[#d7dbe0] bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-[#667085]">AI 供應商</span>
              <select
                value={provider}
                onChange={(event) => void handleProviderChange(event.target.value as ProviderId)}
                className={lightFieldClass}
              >
                {availableProviders.map((item) => (
                  <option key={item.id} value={item.id}>
                    {providerLabel(item)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="mb-1 flex items-center justify-between gap-3 text-[#667085]">
                <span>模型</span>
                <button
                  type="button"
                  disabled={loadingModels || refreshingModels || !canSaveSetting || (isApiProvider && !activeCredential?.configured)}
                  onClick={refreshModels}
                  className="inline-flex items-center gap-1 rounded px-1 text-xs font-medium text-[#007f99] hover:text-[#005f73] disabled:text-[#667085]"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  抓取最新
                </button>
              </span>
              <select
                value={model}
                disabled={loadingModels || models.length === 0}
                onChange={(event) => setModel(event.target.value)}
                className={lightFieldClass}
              >
                {models.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {showReasoningControl || showThinkingControl ? (
            <div className="grid gap-4 md:grid-cols-2">
              {showReasoningControl ? (
                <label className="block text-sm">
                  <span className="mb-1 block text-[#667085]">智慧程度</span>
                  <select
                    value={effectiveReasoningEffort}
                    onChange={(event) => setReasoningEffort(event.target.value as ReasoningEffort)}
                    className={lightFieldClass}
                  >
                    {reasoningOptions.includes("minimal") ? <option value="minimal">基礎，最快</option> : null}
                    {reasoningOptions.includes("low") ? <option value="low">標準，偏快</option> : null}
                    {reasoningOptions.includes("medium") ? <option value="medium">進階，平衡</option> : null}
                    {reasoningOptions.includes("high") ? <option value="high">高智慧，較慢</option> : null}
                    {reasoningOptions.includes("xhigh") ? <option value="xhigh">最高智慧</option> : null}
                  </select>
                </label>
              ) : null}

              {showThinkingControl ? (
                <label className="block text-sm">
                  <span className="mb-1 block text-[#667085]">思考程度</span>
                  <select
                    value={effectiveThinkingLevel}
                    onChange={(event) => setThinkingLevel(event.target.value as ThinkingLevel)}
                    className={lightFieldClass}
                  >
                    {thinkingOptions.includes("none") ? <option value="none">關閉</option> : null}
                    {thinkingOptions.includes("low") ? <option value="low">Low，較快</option> : null}
                    {thinkingOptions.includes("medium") ? <option value="medium">Medium，平衡</option> : null}
                    {thinkingOptions.includes("high") ? <option value="high">High，較深思考</option> : null}
                  </select>
                </label>
              ) : null}
            </div>
          ) : null}

          {isApiProvider ? (
            <div className="rounded-lg border border-[#d7dbe0] bg-[#f8fafc] p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[#111827]">
                <ShieldCheck className="h-4 w-4 text-[#12b76a]" />
                API Key
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_140px]">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder={activeCredential?.hasStoredKey ? "已儲存，輸入新 Key 可覆蓋" : "填入 API Key"}
                  className={lightFieldClass}
                />
                <button
                  type="button"
                  disabled={savingKey}
                  onClick={saveApiKey}
                  className={secondaryButtonClass}
                >
                  {savingKey ? "儲存中..." : apiKey.trim() ? "加密儲存" : "清除 Key"}
                </button>
              </div>
              <p className="mt-2 text-xs text-[#667085]">
                API Key 只會以加密格式存放在目前帳號的資料庫設定中；清除後，此供應商會回到未設定狀態。
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-[#bae6fd] bg-[#ecfeff] p-4 text-sm text-[#344054]">
              <div className="mb-2 flex items-center gap-2 font-medium text-[#111827]">
                <Terminal className="h-4 w-4 text-[#007f99]" />
                本機 CLI 橋接已開放
              </div>
              <p className="leading-6">
                目前是本機模式，可以儲存並測試 {activeProvider?.label || provider}。請確認執行 dev server 的同一個 Windows 使用者已完成 CLI 登入。
              </p>
            </div>
          )}

          <div className="rounded-lg border border-[#d7dbe0] bg-[#f8fafc] p-4 text-sm text-[#344054]">
            <p className="font-medium text-[#111827]">目前模型資訊</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <p>供應商：{activeProvider?.label || provider}</p>
              <p>模型：{model}</p>
              <p>智慧程度：{activeModel ? intelligenceLabels[activeModel.intelligenceTier] : "-"}</p>
              <p>速度：{activeModel ? speedLabels[activeModel.speedTier] : "-"}</p>
              <p>Reasoning：{activeModel?.supportsReasoning ? "支援" : "不支援 / 未知"}</p>
              <p>Thinking：{activeModel?.supportsThinking ? "支援" : "不支援 / 未知"}</p>
            </div>
            {activeModel?.description ? <p className="mt-3 text-xs text-[#667085]">{activeModel.description}</p> : null}
          </div>

          {initialState.localCliEnabled ? <div className="grid gap-3 xl:grid-cols-2">
            {cliConnectionCards.map((card) => (
              <article key={card.id} className="rounded-lg border border-[#bae6fd] bg-[#ecfeff] p-4 text-sm text-[#344054]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Cable className="h-4 w-4 text-[#007f99]" />
                    <h3 className="font-semibold text-[#111827]">{card.title}</h3>
                  </div>
                  <span className="rounded-full border border-[#67e8f9] bg-white px-2 py-0.5 text-[11px] text-[#006d85]">{card.badge}</span>
                </div>
                <p className="mt-3 leading-6">{card.body}</p>
                <button
                  type="button"
                  onClick={() => void applyConnectionPreset(card.provider, card.preferredModel)}
                  className="mt-4 inline-flex items-center gap-2 rounded-md bg-[#00b8d9] px-3 py-2 text-xs font-semibold text-[#111827] hover:bg-[#0098b8]"
                >
                  {card.button}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <div className="mt-4 rounded-md border border-[#d7dbe0] bg-white p-3">
                  <p className="flex items-center gap-2 text-xs font-medium text-[#344054]">
                    <Terminal className="h-3.5 w-3.5 text-[#667085]" />
                    自架 / 本機橋接
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[#667085]">{card.local}</p>
                  <pre className="mt-2 overflow-x-auto rounded bg-black/60 p-2 text-[11px] leading-5 text-zinc-300">
                    {card.commands.join("\n")}
                  </pre>
                </div>
              </article>
            ))}
          </div> : null}
        </div>

        <aside className="rounded-lg border border-[#d7dbe0] bg-white p-5 text-sm text-[#344054] shadow-sm">
          <h3 className="font-medium text-[#111827]">供應商狀態</h3>
          <div className="mt-3 space-y-2">
            {initialState.providers.map((item) => {
              const credential = credentials[item.id];
              const passed = credential?.testStatus === "passed";
              const isCliProvider = item.kind === "cli";
              return (
                <div key={item.id} className="border-b border-[#eef0f2] pb-2 last:border-b-0">
                  <div className="flex items-center justify-between gap-3">
                    <span>{providerLabel(item)}</span>
                    <span className={credential?.configured ? "text-[#039855]" : isCliProvider ? "text-[#007f99]" : "text-[#b54708]"}>
                      {credential?.configured ? (isCliProvider ? "本機可用" : "已設定") : isCliProvider ? "需本機橋接" : "未設定 API Key"}
                    </span>
                  </div>
                  <p className={`mt-1 flex items-center gap-1 text-xs ${passed ? "text-[#039855]" : "text-[#667085]"}`}>
                    {passed ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                    測試：{statusLabel(credential?.testStatus)}
                    {credential?.testedModel ? ` · ${credential.testedModel}` : ""}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 rounded-md border border-[#d7dbe0] bg-[#f8fafc] p-3">
            <p className="flex items-center gap-2 text-xs font-medium text-[#344054]">
              <KeyRound className="h-3.5 w-3.5 text-[#007f99]" />
              連接原則
            </p>
            <p className="mt-2 text-xs leading-5 text-[#667085]">
              模型清單會優先讀取資料庫快取；按「抓取最新」會使用目前帳號已加密儲存的 API Key 呼叫供應商 models API。
              正式站只顯示 API 型供應商；本機 CLI 橋接只會在本機開發模式開啟。
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
