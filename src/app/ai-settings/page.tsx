import { AdminShell } from "@/components/AdminShell";
import { AiSettingsClient } from "@/components/AiSettingsClient";
import {
  AI_PROVIDERS,
  getCredentialsStatus,
  getWorkspaceAiSetting,
  isLocalAiCliEnabled,
  listAiModels,
} from "@/lib/ai/providers";
import { requireUser } from "@/lib/auth";
import { getCurrentWorkspaceId } from "@/lib/workspaces";

export default async function AiSettingsPage() {
  await requireUser();
  const workspaceId = await getCurrentWorkspaceId();
  const setting = await getWorkspaceAiSetting(workspaceId);
  const localCliEnabled = isLocalAiCliEnabled();
  const visibleProviders = AI_PROVIDERS.filter((provider) => provider.kind === "api" || localCliEnabled);
  const [initialModels, credentials] = await Promise.all([
    listAiModels(setting.provider, workspaceId),
    getCredentialsStatus(workspaceId),
  ]);

  return (
    <AdminShell title="AI 設定">
      <AiSettingsClient
        initialState={{
          setting,
          providers: visibleProviders,
          credentials,
          initialModels,
          localCliEnabled,
        }}
      />
    </AdminShell>
  );
}
