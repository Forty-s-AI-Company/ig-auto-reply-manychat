export const AUTOMATION_SCOPE_MODE = "workspace" as const;

export const AUTOMATION_SCOPE_NOTICE =
  "自動化目前是工作區共用，不會因左側 Instagram 帳號切換而篩選。若要改成每個 IG 帳號獨立流程，需要先新增 automation channel scope 資料模型與 migration。";

export function getAutomationScopeNotice(selectedChannelId?: string) {
  return selectedChannelId ? AUTOMATION_SCOPE_NOTICE : "自動化目前顯示整個工作區的流程。";
}
