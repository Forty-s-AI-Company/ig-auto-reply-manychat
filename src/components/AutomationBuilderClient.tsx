"use client";

import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import {
  Bot,
  Check,
  ChevronLeft,
  Clock,
  GitBranch,
  Heart,
  ImageIcon,
  MessageSquareText,
  MoreVertical,
  MousePointer2,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Tag,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type StepType = "send_message" | "add_tag" | "remove_tag" | "wait" | "condition" | "ai_reply" | "set_field";
type TriggerType = "keyword" | "new_contact" | "manual" | "webhook";
type PreviewMode = "preview" | "test";
type PostSelectionMode = "specific" | "all" | "next" | "continue";

type AutomationStep = {
  id?: string;
  order: number;
  type: StepType;
  configJson: Record<string, unknown>;
};

type AutomationRun = {
  id: string;
  status: "running" | "completed" | "failed";
  currentStep: number;
  logsJson: unknown;
  createdAt: string;
  updatedAt: string;
  contact?: { id: string; displayName: string; username?: string | null } | null;
};

type AutomationItem = {
  id: string;
  name: string;
  enabled: boolean;
  triggerType: TriggerType;
  triggerConfigJson: Record<string, unknown>;
  steps: AutomationStep[];
  runs?: AutomationRun[];
  updatedAt?: string;
};

type FlowDraft = {
  id?: string;
  name: string;
  enabled: boolean;
  triggerType: TriggerType;
  keywords: string;
  match: "contains" | "exact";
  postSelectionMode: PostSelectionMode;
  selectedPostId: string;
  selectedPostLabel: string;
  delayEnabled: boolean;
  delaySeconds: number;
  autoLike: boolean;
  publicReplyEnabled: boolean;
  publicReplyText: string;
};

type InstagramMediaItem = {
  id: string;
  caption?: string;
  mediaType?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  permalink?: string;
  timestamp?: string;
};

type FlowNodeData = Record<string, unknown> & {
  kind: "trigger" | "step";
  stepType?: StepType;
  label: string;
  summary: string;
  step?: AutomationStep;
};

type FlowSnapshot = {
  nodes?: Array<{ id: string; position: { x: number; y: number } }>;
  edges?: Edge[];
};

const emptyDraft: FlowDraft = {
  name: "Canva變現",
  enabled: true,
  triggerType: "keyword",
  keywords: "canva, 學習, 学习, can, tips, tip",
  match: "contains",
  postSelectionMode: "specific",
  selectedPostId: "",
  selectedPostLabel: "選擇指定貼文或 Reels",
  delayEnabled: true,
  delaySeconds: 3,
  autoLike: true,
  publicReplyEnabled: true,
  publicReplyText: "私訊傳給你囉✨請記得追蹤我，以免收不到訊息！",
};

const stepMeta: Record<StepType, { label: string; description: string; iconName: string }> = {
  send_message: { label: "傳送訊息", description: "文字、連結、圖片說明或 CTA。", iconName: "message" },
  add_tag: { label: "加入標籤", description: "替聯絡人加上指定標籤。", iconName: "tag" },
  remove_tag: { label: "移除標籤", description: "移除聯絡人身上的標籤。", iconName: "trash" },
  wait: { label: "等待", description: "延遲幾秒後再進下一步。", iconName: "clock" },
  condition: { label: "條件分流", description: "依訊息、標籤或欄位走不同路徑。", iconName: "branch" },
  ai_reply: { label: "AI 回覆", description: "使用知識庫或 AI 產生回覆。", iconName: "bot" },
  set_field: { label: "更新欄位", description: "儲存 Email、電話或其他資料。", iconName: "wand" },
};

const defaultSteps: AutomationStep[] = [
  {
    order: 1,
    type: "condition",
    configJson: {
      title: "留言關鍵字判斷",
      source: "commentText",
      operator: "contains",
      value: "canva, 學習, 学习, can, tips, tip",
    },
  },
  {
    order: 2,
    type: "send_message",
    configJson: {
      title: "留言後公開提醒",
      text: "私訊傳給你囉✨請記得追蹤我，以免收不到訊息！",
    },
  },
  {
    order: 3,
    type: "wait",
    configJson: { title: "等待私訊送達", seconds: 3 },
  },
  {
    order: 4,
    type: "send_message",
    configJson: {
      title: "私訊主訊息",
      text:
        "這是我靠 Canva + IG\n從零到賺進百萬的精華✨\n\n✅ 一份完整教學指南\n✅ 三堂 IG 變現免費課程\n\n點下方按鈕進入 0 元產品頁面\n輸入姓名、Email\n免費教學指南就會寄到你的信箱囉\n\n🌟 第一次領取可能信件會跑去「促銷內容」或「垃圾郵件」\n請務必到 Email 查看\n\n⬇️⬇️⬇️ 點擊按鈕立即領取 ⬇️⬇️⬇️\n\n領取免費指南與課程：{{demo_link}}",
    },
  },
  {
    order: 5,
    type: "condition",
    configJson: {
      title: "是否已追蹤",
      source: "tag",
      operator: "contains",
      value: "已追蹤",
    },
  },
  {
    order: 6,
    type: "send_message",
    configJson: {
      title: "未追蹤提醒",
      text: "嗨～請先追蹤我，再到陌生訊息查看唷✅",
    },
  },
  {
    order: 7,
    type: "send_message",
    configJson: {
      title: "備用回覆",
      text: "收到你的留言囉😆 私訊給你了，追蹤我才能收到🫶🏻",
    },
  },
  { order: 8, type: "add_tag", configJson: { title: "標記 Canva 名單", tagName: "canva-lead" } },
  {
    order: 9,
    type: "set_field",
    configJson: { title: "記錄來源", field: "source", value: "Canva變現留言自動化" },
  },
];

const defaultNodePositions: Record<string, { x: number; y: number }> = {
  trigger: { x: 40, y: 220 },
  "step-1": { x: 330, y: 220 },
  "step-2": { x: 630, y: 140 },
  "step-3": { x: 930, y: 140 },
  "step-4": { x: 1230, y: 120 },
  "step-5": { x: 1530, y: 250 },
  "step-6": { x: 1830, y: 120 },
  "step-7": { x: 630, y: 430 },
  "step-8": { x: 930, y: 430 },
  "step-9": { x: 1230, y: 430 },
};

const defaultEdges: Edge[] = [
  { id: "edge-trigger-keywords", source: "trigger", target: "step-1", animated: true, style: { strokeWidth: 2 } },
  { id: "edge-keywords-comment", source: "step-1", target: "step-2", animated: true, style: { strokeWidth: 2 } },
  { id: "edge-comment-wait", source: "step-2", target: "step-3", animated: true, style: { strokeWidth: 2 } },
  { id: "edge-wait-main-dm", source: "step-3", target: "step-4", animated: true, style: { strokeWidth: 2 } },
  { id: "edge-main-follow-check", source: "step-4", target: "step-5", animated: true, style: { strokeWidth: 2 } },
  { id: "edge-follow-reminder", source: "step-5", target: "step-6", animated: true, style: { strokeWidth: 2 } },
  { id: "edge-keywords-fallback", source: "step-1", target: "step-7", animated: true, style: { strokeWidth: 2 } },
  { id: "edge-fallback-tag", source: "step-7", target: "step-8", animated: true, style: { strokeWidth: 2 } },
  { id: "edge-tag-source", source: "step-8", target: "step-9", animated: true, style: { strokeWidth: 2 } },
];

const canvaSingleReplyDraft: FlowDraft = {
  name: "Canva變現",
  enabled: true,
  triggerType: "keyword",
  keywords: "canva, 學習, 学习, can, tips, tip",
  match: "contains",
  postSelectionMode: "specific",
  selectedPostId: "",
  selectedPostLabel: "選擇貼文或 Reels",
  delayEnabled: false,
  delaySeconds: 0,
  autoLike: true,
  publicReplyEnabled: true,
  publicReplyText: "私訊傳給你囉，請記得追蹤我，以免收不到訊息！",
};

const canvaSingleReplyText =
  "私訊傳給你囉，這是我靠 Canva + IG\n" +
  "從零到賺進百萬的精華✨\n\n" +
  "✅ 一份完整教學指南\n" +
  "✅ 三堂 IG 變現免費課程\n\n" +
  "點下方連結進入 0 元產品頁面\n" +
  "輸入姓名、Email\n" +
  "免費教學指南就會寄到你的信箱囉\n\n" +
  "第一次領取可能信件會跑去「促銷內容」或「垃圾郵件」\n" +
  "請務必到 Email 查看\n\n" +
  "領取免費指南與課程：{{demo_link}}\n\n" +
  "也請記得追蹤我，之後我才能繼續回覆你唷。";

const canvaSingleReplySteps: AutomationStep[] = [
  {
    order: 1,
    type: "condition",
    configJson: {
      title: "留言關鍵字判斷",
      source: "commentText",
      operator: "contains",
      value: "canva, 學習, 学习, can, tips, tip",
    },
  },
  {
    order: 2,
    type: "send_message",
    configJson: {
      title: "留言後私訊主內容",
      text: canvaSingleReplyText,
    },
  },
  { order: 3, type: "add_tag", configJson: { title: "標記 Canva 名單", tagName: "canva-lead" } },
  {
    order: 4,
    type: "set_field",
    configJson: { title: "記錄來源", field: "locale", value: "Canva變現留言自動化" },
  },
];

const canvaSingleReplyEdges: Edge[] = [
  { id: "edge-trigger-keywords", source: "trigger", target: "step-1", animated: true, style: { strokeWidth: 2 } },
  { id: "edge-keywords-dm", source: "step-1", target: "step-2", animated: true, style: { strokeWidth: 2 } },
  { id: "edge-dm-tag", source: "step-2", target: "step-3", animated: true, style: { strokeWidth: 2 } },
  { id: "edge-tag-source", source: "step-3", target: "step-4", animated: true, style: { strokeWidth: 2 } },
];

void emptyDraft;
void defaultSteps;
void defaultEdges;

function IconByName({ name, className }: { name: string; className?: string }) {
  const props = { className };
  if (name === "tag") return <Tag {...props} />;
  if (name === "trash") return <Trash2 {...props} />;
  if (name === "clock") return <Clock {...props} />;
  if (name === "branch") return <GitBranch {...props} />;
  if (name === "bot") return <Bot {...props} />;
  if (name === "wand") return <Wand2 {...props} />;
  return <MessageSquareText {...props} />;
}

function keywordList(config: Record<string, unknown>) {
  return Array.isArray(config.keywords) ? config.keywords.map(String) : [];
}

function getFlowSnapshot(config: Record<string, unknown>): FlowSnapshot {
  const flow = config.flow;
  if (!flow || typeof flow !== "object") return {};
  return flow as FlowSnapshot;
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function numberValue(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function booleanValue(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function postModeValue(value: unknown): PostSelectionMode {
  return value === "all" || value === "next" || value === "continue" || value === "specific" ? value : "specific";
}

function postSelectionLabel(mode: PostSelectionMode) {
  if (mode === "all") return "所有貼文或 Reels";
  if (mode === "next") return "下一篇貼文或 Reels";
  if (mode === "continue") return "沿用目前設定";
  return "指定貼文或 Reels";
}

function mediaTitle(item: InstagramMediaItem) {
  const caption = item.caption?.replace(/\s+/g, " ").trim();
  if (caption) return caption.length > 52 ? `${caption.slice(0, 52)}...` : caption;
  return `${item.mediaType || "MEDIA"} ${item.id}`;
}

function stepSummary(step: AutomationStep) {
  if (step.configJson.title) return String(step.configJson.title);
  if (step.type === "send_message") return String(step.configJson.text || "尚未設定訊息內容");
  if (step.type === "add_tag") return `加入標籤：${String(step.configJson.tagName || "lead")}`;
  if (step.type === "remove_tag") return `移除標籤：${String(step.configJson.tagName || "lead")}`;
  if (step.type === "wait") return `等待 ${String(step.configJson.seconds || 5)} 秒`;
  if (step.type === "ai_reply") return "使用 AI / 知識庫自動回覆";
  if (step.type === "set_field") return `${String(step.configJson.field || "email")} = ${String(step.configJson.value || "")}`;
  return `${String(step.configJson.source || "訊息")} ${String(step.configJson.operator || "包含")} ${String(step.configJson.value || "")}`;
}

function createStep(type: StepType, order: number): AutomationStep {
  if (type === "send_message") return { order, type, configJson: { text: "嗨，這是新的自動回覆訊息。" } };
  if (type === "add_tag") return { order, type, configJson: { tagName: "lead" } };
  if (type === "remove_tag") return { order, type, configJson: { tagName: "lead" } };
  if (type === "wait") return { order, type, configJson: { seconds: 5 } };
  if (type === "condition") return { order, type, configJson: { source: "inboundText", operator: "contains", value: "" } };
  if (type === "set_field") return { order, type, configJson: { field: "email", value: "" } };
  return { order, type, configJson: {} };
}

function makeStepNode(step: AutomationStep, id: string, position: { x: number; y: number }, selected = false): Node<FlowNodeData> {
  const meta = stepMeta[step.type];
  return {
    id,
    type: "flowNode",
    position,
    selected,
    data: {
      kind: "step",
      stepType: step.type,
      label: String(step.configJson.title || meta.label),
      summary: stepSummary(step),
      step,
    },
  };
}

function makeTriggerNode(draft: FlowDraft, selected = false): Node<FlowNodeData> {
  return {
    id: "trigger",
    type: "flowNode",
    position: { x: 40, y: 160 },
    selected,
    data: {
      kind: "trigger",
      label: "When 留言於貼文/Reels",
      summary:
        draft.triggerType === "keyword"
          ? `${postSelectionLabel(draft.postSelectionMode)} · 留言包含：${draft.keywords || "尚未設定"}`
          : draft.triggerType,
    },
  };
}

function buildDraft(item?: AutomationItem): FlowDraft {
  if (!item) return canvaSingleReplyDraft;
  const config = item.triggerConfigJson || {};
  return {
    id: item.id,
    name: item.name,
    enabled: item.enabled,
    triggerType: item.triggerType,
    keywords: keywordList(config).join(", "),
    match: config.match === "exact" ? "exact" : "contains",
    postSelectionMode: postModeValue(config.postSelectionMode),
    selectedPostId: stringValue(config.selectedPostId),
    selectedPostLabel: stringValue(config.selectedPostLabel, "選擇指定貼文或 Reels"),
    delayEnabled: booleanValue(config.delayEnabled, true),
    delaySeconds: numberValue(config.delaySeconds, 3),
    autoLike: booleanValue(config.autoLike, true),
    publicReplyEnabled: booleanValue(config.publicReplyEnabled, true),
    publicReplyText: stringValue(config.publicReplyText, "私訊傳給你囉✨請記得追蹤我，以免收不到訊息！"),
  };
}

function buildGraph(draft: FlowDraft, item?: AutomationItem) {
  const steps = item?.steps?.length ? item.steps.slice().sort((a, b) => a.order - b.order) : canvaSingleReplySteps;
  const snapshot = item ? getFlowSnapshot(item.triggerConfigJson) : {};
  const positionMap = new Map(snapshot.nodes?.map((node) => [node.id, node.position]) || Object.entries(defaultNodePositions));
  const nodes: Node<FlowNodeData>[] = [
    { ...makeTriggerNode(draft, true), position: positionMap.get("trigger") || defaultNodePositions.trigger },
    ...steps.map((step, index) =>
      makeStepNode(step, `step-${index + 1}`, positionMap.get(`step-${index + 1}`) || { x: 320 + index * 290, y: 160 }),
    ),
  ];
  const edges =
    snapshot.edges?.length
      ? snapshot.edges
      : !item
        ? canvaSingleReplyEdges
      : steps.map((_, index) => ({
          id: `edge-${index}`,
          source: index === 0 ? "trigger" : `step-${index}`,
          target: `step-${index + 1}`,
          animated: true,
          style: { strokeWidth: 2 },
        }));
  return { nodes, edges };
}

function toPayload(draft: FlowDraft, nodes: Node<FlowNodeData>[], edges: Edge[]) {
  const keywords = draft.keywords
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
  const stepNodes = nodes
    .filter((node) => node.data.kind === "step" && node.data.step)
    .sort((a, b) => {
      const aOrder = a.data.step?.order;
      const bOrder = b.data.step?.order;
      if (typeof aOrder === "number" && typeof bOrder === "number") return aOrder - bOrder;
      return a.position.x - b.position.x || a.position.y - b.position.y;
    });
  const steps = stepNodes.map((node, index) => ({
    ...(node.data.step as AutomationStep),
    order: index + 1,
  }));
  const flow = {
    nodes: nodes.map((node) => ({ id: node.id, position: node.position })),
    edges,
  };

  return {
    name: draft.name.trim(),
    enabled: draft.enabled,
    triggerType: draft.triggerType,
    triggerConfigJson:
      draft.triggerType === "keyword"
        ? {
            keywords,
            match: draft.match,
            postSelectionMode: draft.postSelectionMode,
            selectedPostId: draft.selectedPostId,
            selectedPostLabel: draft.selectedPostLabel,
            delayEnabled: draft.delayEnabled,
            delaySeconds: draft.delaySeconds,
            autoLike: draft.autoLike,
            publicReplyEnabled: draft.publicReplyEnabled,
            publicReplyText: draft.publicReplyText,
            flow,
          }
        : { source: draft.triggerType, flow },
    steps,
  };
}

function formatDateTime(value?: string) {
  if (!value) return "尚未更新";
  return new Intl.DateTimeFormat("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function FlowNode({ id, data, selected }: NodeProps<Node<FlowNodeData>>) {
  const isTrigger = data.kind === "trigger";
  const iconName = data.stepType ? stepMeta[data.stepType].iconName : "sparkles";
  const notifySelection = () => window.dispatchEvent(new CustomEvent("automation-flow-node-select", { detail: id }));

  return (
    <div
      onPointerDown={notifySelection}
      onClick={notifySelection}
      data-testid={`flow-node-${id}`}
      className={`min-w-[250px] cursor-pointer rounded-md border bg-white p-4 shadow-md transition ${
        selected ? "border-emerald-500 ring-2 ring-emerald-200" : isTrigger ? "border-emerald-300" : "border-zinc-200"
      }`}
    >
      {!isTrigger ? <Handle type="target" position={Position.Left} className="!h-4 !w-4 !border-2 !bg-blue-500" /> : null}
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-zinc-100">
          {isTrigger ? <Sparkles className="h-5 w-5 text-emerald-600" /> : <IconByName name={iconName} className="h-5 w-5 text-blue-600" />}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-zinc-950">{data.label}</p>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-zinc-500">{data.summary}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!h-4 !w-4 !border-2 !bg-blue-500" />
    </div>
  );
}

const nodeTypes = { flowNode: FlowNode };

function StepConfigEditor({
  node,
  draft,
  mediaItems,
  mediaLoading,
  mediaError,
  onDraftChange,
  onRefreshMedia,
  onChange,
}: {
  node?: Node<FlowNodeData>;
  draft: FlowDraft;
  mediaItems: InstagramMediaItem[];
  mediaLoading: boolean;
  mediaError: string;
  onDraftChange: (draft: FlowDraft) => void;
  onRefreshMedia: () => void;
  onChange: (node: Node<FlowNodeData>) => void;
}) {
  if (!node) return null;

  if (node.data.kind === "trigger") {
    const postOptions: Array<{ value: PostSelectionMode; label: string; description: string; badge?: string }> = [
      { value: "specific", label: "指定貼文或 Reels", description: "只在你選定的貼文留言時觸發。" },
      { value: "all", label: "所有貼文或 Reels", description: "所有現有與未來貼文留言都可觸發。", badge: "PRO" },
      { value: "next", label: "下一篇貼文或 Reels", description: "下一次發布的內容留言才啟動。", badge: "PRO" },
      { value: "continue", label: "沿用目前設定", description: "保留既有貼文範圍，繼續下一步設定。" },
    ];

    return (
      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Step 1 of 3</p>
          <h3 className="mt-2 text-xl font-semibold text-zinc-950">When 留言觸發</h3>
          <p className="mt-1 text-sm text-zinc-500">選擇哪些 IG 貼文或 Reels 的留言要進入這個自動化。</p>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-zinc-700">自動化名稱</span>
          <input
            value={draft.name}
            onChange={(event) => onDraftChange({ ...draft, name: event.target.value })}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none focus:border-blue-500"
          />
        </label>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-zinc-700">貼文範圍</p>
            <button
              type="button"
              onClick={onRefreshMedia}
              disabled={mediaLoading}
              data-testid="trigger-fetch-media"
              className="inline-flex items-center gap-1 rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${mediaLoading ? "animate-spin" : ""}`} />
              抓取貼文
            </button>
          </div>
          <div className="grid gap-2">
            {postOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onDraftChange({ ...draft, postSelectionMode: option.value })}
                data-testid={`trigger-post-mode-${option.value}`}
                className={`rounded-md border p-3 text-left transition ${
                  draft.postSelectionMode === option.value
                    ? "border-blue-500 bg-blue-50 ring-1 ring-blue-200"
                    : "border-zinc-200 bg-white hover:border-blue-200 hover:bg-zinc-50"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-medium text-zinc-950">{option.label}</span>
                  {option.badge ? <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">{option.badge}</span> : null}
                </span>
                <span className="mt-1 block text-xs leading-5 text-zinc-500">{option.description}</span>
              </button>
            ))}
          </div>
        </div>

        {draft.postSelectionMode === "specific" ? (
          <div className="rounded-md border border-zinc-200 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
              <ImageIcon className="h-4 w-4 text-blue-600" />
              選擇貼文
            </div>
            {mediaError ? <p className="mb-2 rounded-md bg-amber-50 p-2 text-xs leading-5 text-amber-800">{mediaError}</p> : null}
            <select
              value={draft.selectedPostId}
              onChange={(event) => {
                const selected = mediaItems.find((item) => item.id === event.target.value);
                onDraftChange({
                  ...draft,
                  selectedPostId: event.target.value,
                  selectedPostLabel: selected ? mediaTitle(selected) : "選擇指定貼文或 Reels",
                });
              }}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-950 outline-none focus:border-blue-500"
            >
              <option value="">{mediaLoading ? "正在抓取貼文..." : "請選擇一篇貼文或 Reels"}</option>
              {mediaItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {mediaTitle(item)}
                </option>
              ))}
            </select>
            {draft.selectedPostId ? (
              <p className="mt-2 text-xs leading-5 text-zinc-500">目前選擇：{draft.selectedPostLabel || draft.selectedPostId}</p>
            ) : null}
          </div>
        ) : null}

        <label className="block text-sm">
          <span className="mb-1 block font-medium text-zinc-700">留言關鍵字</span>
          <input
            value={draft.keywords}
            onChange={(event) => onDraftChange({ ...draft, keywords: event.target.value })}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none focus:border-blue-500"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">比對方式</span>
            <select
              value={draft.match}
              onChange={(event) => onDraftChange({ ...draft, match: event.target.value === "exact" ? "exact" : "contains" })}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none focus:border-blue-500"
            >
              <option value="contains">包含任一關鍵字</option>
              <option value="exact">完全符合</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">延遲秒數</span>
            <input
              type="number"
              min="0"
              value={draft.delaySeconds}
              onChange={(event) => onDraftChange({ ...draft, delaySeconds: Number(event.target.value) })}
              disabled={!draft.delayEnabled}
              data-testid="trigger-delay-seconds"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none focus:border-blue-500 disabled:bg-zinc-100"
            />
          </label>
        </div>

        <div className="grid gap-2">
          <label className="flex items-center gap-2 rounded-md border border-zinc-200 p-3 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={draft.delayEnabled}
              onChange={(event) => onDraftChange({ ...draft, delayEnabled: event.target.checked })}
              data-testid="trigger-delay-enabled"
            />
            延遲後再執行自動化
          </label>
          <label className="flex items-center gap-2 rounded-md border border-zinc-200 p-3 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={draft.autoLike}
              onChange={(event) => onDraftChange({ ...draft, autoLike: event.target.checked })}
              data-testid="trigger-auto-like"
            />
            <Heart className="h-4 w-4 text-rose-500" />
            自動幫符合條件的留言按讚
          </label>
          <label className="flex items-center gap-2 rounded-md border border-zinc-200 p-3 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={draft.publicReplyEnabled}
              onChange={(event) => onDraftChange({ ...draft, publicReplyEnabled: event.target.checked })}
              data-testid="trigger-public-reply-enabled"
            />
            自動公開回覆留言
          </label>
        </div>

        {draft.publicReplyEnabled ? (
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">公開回覆內容</span>
            <textarea
              value={draft.publicReplyText}
              onChange={(event) => onDraftChange({ ...draft, publicReplyText: event.target.value })}
              rows={3}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none focus:border-blue-500"
            />
          </label>
        ) : null}

        <label className="flex items-center gap-2 rounded-md border border-zinc-200 p-3 text-sm text-zinc-700">
          <input
            type="checkbox"
            checked={draft.enabled}
            onChange={(event) => onDraftChange({ ...draft, enabled: event.target.checked })}
          />
          啟用這個自動化
        </label>
      </div>
    );
  }

  const step = node.data.step;
  if (!step) return null;

  function updateConfig(configJson: Record<string, unknown>) {
    if (!node || !step) return;
    const nextStep = { ...step, configJson };
    onChange({
      ...node,
      id: node.id,
      position: node.position,
      data: {
        ...node.data,
        summary: stepSummary(nextStep),
        step: nextStep,
      },
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Step {step.order}</p>
        <h3 className="mt-2 text-xl font-semibold text-zinc-950">{stepMeta[step.type].label}</h3>
        <p className="mt-1 text-sm text-zinc-500">{stepMeta[step.type].description}</p>
      </div>

      {step.type === "send_message" ? (
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-zinc-700">訊息內容</span>
          <textarea
            value={String(step.configJson.text || "")}
            onChange={(event) => updateConfig({ ...step.configJson, text: event.target.value })}
            rows={8}
            placeholder="輸入要傳送給顧客的訊息"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none focus:border-blue-500"
          />
        </label>
      ) : null}

      {step.type === "add_tag" || step.type === "remove_tag" ? (
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-zinc-700">標籤名稱</span>
          <input
            value={String(step.configJson.tagName || "")}
            onChange={(event) => updateConfig({ ...step.configJson, tagName: event.target.value })}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none focus:border-blue-500"
          />
        </label>
      ) : null}

      {step.type === "wait" ? (
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-zinc-700">等待秒數</span>
          <input
            type="number"
            min="1"
            value={String(step.configJson.seconds || 5)}
            onChange={(event) => updateConfig({ ...step.configJson, seconds: Number(event.target.value) })}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none focus:border-blue-500"
          />
        </label>
      ) : null}

      {step.type === "condition" ? (
        <div className="grid gap-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">來源</span>
            <select
              value={String(step.configJson.source || "inboundText")}
              onChange={(event) => updateConfig({ ...step.configJson, source: event.target.value })}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none focus:border-blue-500"
            >
              <option value="commentText">IG 留言內容</option>
              <option value="inboundText">用戶訊息</option>
              <option value="tag">聯絡人標籤</option>
              <option value="consentStatus">訂閱狀態</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">條件</span>
            <select
              value={String(step.configJson.operator || "contains")}
              onChange={(event) => updateConfig({ ...step.configJson, operator: event.target.value })}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none focus:border-blue-500"
            >
              <option value="contains">包含</option>
              <option value="not_contains">不包含</option>
              <option value="equals">等於</option>
              <option value="not_equals">不等於</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">比對值</span>
            <input
              value={String(step.configJson.value || "")}
              onChange={(event) => updateConfig({ ...step.configJson, value: event.target.value })}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none focus:border-blue-500"
            />
          </label>
        </div>
      ) : null}

      {step.type === "set_field" ? (
        <div className="grid gap-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">欄位</span>
            <select
              value={String(step.configJson.field || "email")}
              onChange={(event) => updateConfig({ ...step.configJson, field: event.target.value })}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none focus:border-blue-500"
            >
              <option value="displayName">顯示名稱</option>
              <option value="username">使用者名稱</option>
              <option value="email">電子信箱</option>
              <option value="phone">電話</option>
              <option value="source">來源</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-zinc-700">值</span>
            <input
              value={String(step.configJson.value || "")}
              onChange={(event) => updateConfig({ ...step.configJson, value: event.target.value })}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none focus:border-blue-500"
            />
          </label>
        </div>
      ) : null}

      {step.type === "ai_reply" ? (
        <div className="rounded-md border border-blue-100 bg-blue-50 p-3 text-sm leading-6 text-blue-900">
          這個節點會依照知識庫與 AI 設定自動產生回覆。下一階段可以再把模型、語氣、資料來源做成細項設定。
        </div>
      ) : null}
    </div>
  );
}

function FlowBuilderInner({ initialItems }: { initialItems: AutomationItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [draft, setDraft] = useState<FlowDraft>(() => buildDraft());
  const initialGraph = useMemo(() => buildGraph(canvaSingleReplyDraft), []);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<FlowNodeData>>(initialGraph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialGraph.edges);
  const [selectedNodeId, setSelectedNodeId] = useState("trigger");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "stopped">("all");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("preview");
  const [editorOpen, setEditorOpen] = useState(true);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<InstagramMediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState("");
  const nodeCounterRef = useRef(1000);
  const { fitView, screenToFlowPosition } = useReactFlow();

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);
  const selectedStep = selectedNode?.data.step;
  const firstMessage =
    nodes.find((node) => node.data.step?.type === "send_message" && node.data.step.configJson.title === "私訊主訊息")?.data.step ||
    nodes.find((node) => node.data.step?.type === "send_message")?.data.step;
  const previewText = String(firstMessage?.configJson.text || "嗨，這是自動回覆訊息。");
  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.enabled) ||
        (statusFilter === "stopped" && !item.enabled);
      return matchesSearch && matchesStatus;
    });
  }, [items, search, statusFilter]);

  const selectNode = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setEditorOpen(true);
    setNodes((current) => current.map((node) => ({ ...node, selected: node.id === nodeId })));
  }, [setNodes]);

  useEffect(() => {
    function handleNodeSelect(event: Event) {
      const nodeId = (event as CustomEvent<string>).detail;
      if (typeof nodeId === "string") selectNode(nodeId);
    }

    window.addEventListener("automation-flow-node-select", handleNodeSelect);
    return () => window.removeEventListener("automation-flow-node-select", handleNodeSelect);
  }, [selectNode]);

  useEffect(() => {
    setNodes((current) =>
      current.map((node) => {
        if (node.id === "trigger") {
          return { ...makeTriggerNode(draft, node.selected), position: node.position };
        }

        const step = node.data.step;
        if (!step) return node;

        if (step.configJson.title === "留言後公開提醒") {
          const nextStep = {
            ...step,
            configJson: { ...step.configJson, text: draft.publicReplyEnabled ? draft.publicReplyText : "" },
          };
          return { ...node, data: { ...node.data, summary: stepSummary(nextStep), step: nextStep } };
        }

        if (step.configJson.title === "等待私訊送達") {
          const nextStep = {
            ...step,
            configJson: { ...step.configJson, seconds: draft.delayEnabled ? draft.delaySeconds : 0 },
          };
          return { ...node, data: { ...node.data, summary: stepSummary(nextStep), step: nextStep } };
        }

        return node;
      }),
    );
  }, [draft, setNodes]);

  const refreshMedia = useCallback(async () => {
    setMediaLoading(true);
    setMediaError("");
    try {
      const response = await fetch("/api/instagram/media", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "無法讀取 IG 貼文。");
      setMediaItems(Array.isArray(data.items) ? data.items : []);
      if (!data.items?.length) setMediaError(data.warning || "目前沒有讀到可選擇的貼文或 Reels。");
    } catch (err) {
      setMediaItems([]);
      setMediaError(err instanceof Error ? err.message : "無法讀取 IG 貼文。");
    } finally {
      setMediaLoading(false);
    }
  }, []);

  async function reload() {
    const response = await fetch("/api/automations");
    if (response.ok) setItems(await response.json());
  }

  function loadAutomation(item?: AutomationItem) {
    const nextDraft = buildDraft(item);
    const graph = buildGraph(nextDraft, item);
    setDraft(nextDraft);
    setNodes(graph.nodes.map((node) => ({ ...node, selected: node.id === "trigger" })));
    setEdges(graph.edges);
    setSelectedNodeId("trigger");
    setEditorOpen(true);
    setError("");
  }

  function addStep(type: StepType, position = { x: 480, y: 280 }) {
    nodeCounterRef.current += 1;
    const id = `step-${nodeCounterRef.current}`;
    const step = createStep(type, nodes.filter((node) => node.data.kind === "step").length + 1);
    const nextNode = makeStepNode(step, id, position, true);
    setNodes((current) => [...current.map((node) => ({ ...node, selected: false })), nextNode]);
    setSelectedNodeId(id);
    setEditorOpen(true);
    setLibraryOpen(false);
  }

  function autoArrange() {
    setNodes((current) =>
      current.map((node, index) => ({
        ...node,
        position: defaultNodePositions[node.id] || (node.id === "trigger" ? { x: 40, y: 180 } : { x: 320 + (index - 1) * 290, y: 180 }),
      })),
    );
    window.setTimeout(() => fitView({ padding: 0.18, duration: 350 }), 50);
  }

  function updateNode(nextNode: Node<FlowNodeData>) {
    setNodes((current) => current.map((node) => (node.id === nextNode.id ? { ...nextNode, selected: true } : node)));
  }

  function deleteSelectedNode() {
    if (!selectedNode || selectedNode.id === "trigger") return;
    setNodes((current) => current.filter((node) => node.id !== selectedNode.id).map((node) => ({ ...node, selected: node.id === "trigger" })));
    setEdges((current) => current.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
    setSelectedNodeId("trigger");
  }

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((current) => addEdge({ ...connection, animated: true, style: { strokeWidth: 2 } }, current)),
    [setEdges],
  );

  function onDragStart(event: React.DragEvent<HTMLButtonElement>, type: StepType) {
    event.dataTransfer.setData("application/x-step-type", type);
    event.dataTransfer.effectAllowed = "move";
  }

  function onDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const type = event.dataTransfer.getData("application/x-step-type") as StepType;
    if (!type) return;
    addStep(type, screenToFlowPosition({ x: event.clientX, y: event.clientY }));
  }

  async function saveFlow() {
    setError("");
    setSaving(true);
    try {
      const payload = toPayload(draft, nodes, edges);
      if (!payload.name) throw new Error("請輸入自動化名稱。");
      if (payload.triggerType === "keyword" && !keywordList(payload.triggerConfigJson).length) {
        throw new Error("請至少設定一個關鍵字。");
      }
      if (!payload.steps.length) throw new Error("請至少新增一個流程節點。");

      const endpoint = draft.id ? `/api/automations/${draft.id}` : "/api/automations";
      const response = await fetch(endpoint, {
        method: draft.id ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "儲存失敗。");
      await reload();
      loadAutomation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "儲存失敗。");
    } finally {
      setSaving(false);
    }
  }

  async function deleteFlow(id: string) {
    if (!confirm("確定要刪除這個自動化嗎？")) return;
    await fetch(`/api/automations/${id}`, { method: "DELETE" });
    await reload();
    loadAutomation();
  }

  return (
    <div className="h-[calc(100vh-112px)] w-full overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 text-zinc-950">
      <div className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4">
        <div className="flex min-w-0 items-center gap-3">
          <a href="/dashboard" className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100">
            <ChevronLeft className="h-5 w-5" />
          </a>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <span>Automations</span>
              <span>/</span>
              <span className="truncate">流程編輯器</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                className="min-w-0 bg-transparent text-lg font-semibold text-zinc-950 outline-none"
              />
              <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">LIVE</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-sm text-zinc-500">
            <Check className="h-4 w-4" />
            {draft.id ? "已儲存" : "草稿"}
          </span>
          <button type="button" className="rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50">
            Preview
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={saveFlow}
            className="inline-flex items-center gap-2 rounded-md bg-[#006fe6] px-4 py-2 text-sm font-medium text-white hover:bg-[#0057b8] disabled:bg-[#d7dbe0] disabled:text-[#667085]"
          >
            <Save className="h-4 w-4" />
            {saving ? "儲存中..." : "儲存"}
          </button>
          <button type="button" className="rounded-md border border-zinc-300 p-2 text-zinc-600 hover:bg-zinc-50">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error ? <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div> : null}

      <div className="grid h-[calc(100%-4rem)] min-w-0 grid-cols-[340px_minmax(0,1fr)_320px]">
        <aside className={`${editorOpen ? "block" : "hidden"} overflow-y-auto border-r border-zinc-200 bg-white`}>
          <div className="flex h-14 items-center justify-between border-b border-zinc-200 bg-emerald-50 px-4">
            <div className="min-w-0">
              <p className="truncate font-semibold text-zinc-950">{selectedNode?.data.label || "尚未選取節點"}</p>
              <p className="text-xs text-zinc-500">點選畫布節點即可編輯</p>
            </div>
            <button type="button" onClick={() => setEditorOpen(false)} className="rounded-md p-2 hover:bg-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-5 p-4">
            <StepConfigEditor
              node={selectedNode}
              draft={draft}
              mediaItems={mediaItems}
              mediaLoading={mediaLoading}
              mediaError={mediaError}
              onDraftChange={setDraft}
              onRefreshMedia={refreshMedia}
              onChange={updateNode}
            />
            {selectedNode?.id !== "trigger" ? (
              <button
                type="button"
                onClick={deleteSelectedNode}
                className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                刪除節點
              </button>
            ) : null}
            <div className="border-t border-zinc-200 pt-4">
              <label className="flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm">
                <Search className="h-4 w-4 text-zinc-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="搜尋其他自動化"
                  className="min-w-0 flex-1 outline-none"
                />
              </label>
              <div className="mt-3 flex gap-2 text-xs">
                {[
                  ["all", "全部"],
                  ["active", "啟用中"],
                  ["stopped", "已停止"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setStatusFilter(value as typeof statusFilter)}
                    className={`rounded-md px-2 py-1 ${
                      statusFilter === value ? "bg-[#006fe6] text-white" : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-3 space-y-2">
                {visibleItems.slice(0, 5).map((item) => (
                  <article key={item.id} className="rounded-md border border-zinc-200 p-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <button type="button" onClick={() => loadAutomation(item)} className="min-w-0 text-left">
                        <p className="truncate font-medium text-zinc-950">{item.name}</p>
                        <p className="mt-1 text-xs text-zinc-500">{formatDateTime(item.updatedAt)}</p>
                      </button>
                      <button type="button" onClick={() => deleteFlow(item.id)} className="text-zinc-400 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="relative min-w-0 bg-[#f3f6f8]">
          <div className="absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-md bg-white px-3 py-2 text-sm text-zinc-500 shadow">
            👇 點選節點即可編輯
          </div>
          {!editorOpen ? (
            <button
              type="button"
              onClick={() => setEditorOpen(true)}
              className="absolute left-3 top-1/2 z-20 rounded-full bg-white p-3 text-zinc-500 shadow hover:text-zinc-950"
            >
              <ChevronLeft className="h-5 w-5 rotate-180" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setLibraryOpen((value) => !value)}
            data-testid="flow-add-node"
            className="absolute right-8 top-20 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-[#006fe6] text-white shadow-xl hover:bg-[#0057b8]"
            aria-label="新增節點"
          >
            <Plus className="h-7 w-7" />
          </button>
          <button
            type="button"
            onClick={autoArrange}
            data-testid="flow-auto-arrange"
            className="absolute right-8 top-40 z-20 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow hover:bg-zinc-50"
          >
            自動排列
          </button>
          {libraryOpen ? (
            <div className="absolute right-8 top-52 z-20 w-72 rounded-lg border border-zinc-200 bg-white p-3 shadow-xl" data-testid="flow-node-library">
              <p className="mb-3 text-sm font-semibold text-zinc-950">新增步驟</p>
              <div className="grid gap-2">
                {(Object.keys(stepMeta) as StepType[]).map((type) => {
                  const meta = stepMeta[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      draggable
                      onDragStart={(event) => onDragStart(event, type)}
                      onClick={() => addStep(type)}
                      className="flex items-center gap-3 rounded-md border border-zinc-200 px-3 py-2 text-left text-sm hover:border-blue-300 hover:bg-blue-50"
                    >
                      <IconByName name={meta.iconName} className="h-4 w-4 text-blue-600" />
                      <span>
                        <span className="block font-medium text-zinc-950">{meta.label}</span>
                        <span className="block text-xs text-zinc-500">{meta.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="h-full min-h-[520px]" onDrop={onDrop} onDragOver={(event) => event.preventDefault()}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={(_, node) => selectNode(node.id)}
              onNodeDragStart={(_, node) => selectNode(node.id)}
              onSelectionChange={({ nodes: selectedNodes }) => {
                const nextSelectedId = selectedNodes[0]?.id;
                if (nextSelectedId && nextSelectedId !== selectedNodeId) setSelectedNodeId(nextSelectedId);
              }}
              nodeClickDistance={8}
              nodesDraggable
              nodesConnectable
              elementsSelectable
              connectOnClick
              fitView
            >
              <Background />
              <Controls />
              <MiniMap className="!pointer-events-none" style={{ width: 150, height: 100 }} />
            </ReactFlow>
          </div>
        </main>

        <aside className="overflow-y-auto border-l border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 p-4">
            <div className="flex rounded-md bg-zinc-100 p-1 text-sm">
              {(["preview", "test"] as PreviewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPreviewMode(mode)}
                  className={`flex-1 rounded px-3 py-1.5 ${
                    previewMode === mode ? "bg-white font-medium text-zinc-950 shadow-sm" : "text-zinc-500"
                  }`}
                >
                  {mode === "preview" ? "Preview" : "Test"}
                </button>
              ))}
            </div>
          </div>
          <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-zinc-950">IG 商業聊天模擬</p>
                <p className="text-xs text-zinc-500">{previewMode === "preview" ? "預覽目前流程" : "測試目前節點路徑"}</p>
              </div>
              <MousePointer2 className="h-4 w-4 text-blue-600" />
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
              <div className="ml-auto max-w-[78%] rounded-2xl rounded-br-md bg-[#006fe6] px-3 py-2 text-sm text-white">
                {draft.keywords.split(",")[0] || "價格"}
              </div>
              <div className="mt-3 max-w-[88%] whitespace-pre-wrap rounded-2xl rounded-bl-md bg-white px-3 py-2 text-sm leading-6 text-zinc-900 shadow-sm">
                {previewText}
              </div>
              {selectedStep ? (
                <div className="mt-3 rounded-md border border-dashed border-zinc-300 bg-white p-3 text-xs leading-5 text-zinc-500">
                  目前選取：{stepMeta[selectedStep.type].label}
                  <br />
                  {stepSummary(selectedStep)}
                </div>
              ) : null}
              {previewMode === "test" ? (
                <button
                  type="button"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100"
                >
                  <RotateCcw className="h-4 w-4" />
                  Restart
                </button>
              ) : null}
            </div>
            <a
              href="/automations/instagram-default-reply"
              className="mt-4 block rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 hover:bg-emerald-100"
            >
              Instagram 預設回覆設定
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function AutomationBuilderClient({ initialItems }: { initialItems: AutomationItem[] }) {
  return (
    <ReactFlowProvider>
      <FlowBuilderInner initialItems={initialItems} />
    </ReactFlowProvider>
  );
}
