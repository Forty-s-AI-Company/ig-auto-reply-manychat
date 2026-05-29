import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getCredentialsStatus,
  getProviderApiKey,
  getWorkspaceAiSetting,
  isLocalAiCliEnabled,
  saveProviderApiKey,
} from "@/lib/ai/providers";
import { getDb } from "@/lib/db";

const db = getDb();

async function cleanDb() {
  await db.workspaceAiCredential.deleteMany();
  await db.workspaceAiSetting.deleteMany();
  await db.workspace.deleteMany();
}

describe("AI provider credentials", () => {
  beforeEach(async () => {
    await cleanDb();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not treat .env provider keys as SaaS account settings", async () => {
    vi.stubEnv("OPENAI_API_KEY", "env-only-key");
    const workspace = await db.workspace.create({
      data: { id: "ai-env-workspace", name: "AI Env Workspace", slug: "ai-env-workspace" },
    });

    await expect(getProviderApiKey(workspace.id, "chatgpt")).resolves.toBe("");
    const status = await getCredentialsStatus(workspace.id);

    expect(status.chatgpt.configured).toBe(false);
    expect(status.chatgpt.hasStoredKey).toBe(false);
    expect(status.chatgpt.testStatus).toBe("missing");
  });

  it("uses the encrypted API key saved for the current workspace", async () => {
    const workspace = await db.workspace.create({
      data: { id: "ai-key-workspace", name: "AI Key Workspace", slug: "ai-key-workspace" },
    });

    await saveProviderApiKey({ workspaceId: workspace.id, provider: "chatgpt", apiKey: "stored-account-key" });

    await expect(getProviderApiKey(workspace.id, "chatgpt")).resolves.toBe("stored-account-key");
    const status = await getCredentialsStatus(workspace.id);

    expect(status.chatgpt.configured).toBe(true);
    expect(status.chatgpt.hasStoredKey).toBe(true);
    expect(status.chatgpt.testStatus).toBe("untested");
  });

  it("does not crash when a stored API key cannot be decrypted", async () => {
    const workspace = await db.workspace.create({
      data: { id: "ai-invalid-key-workspace", name: "AI Invalid Key Workspace", slug: "ai-invalid-key-workspace" },
    });
    await db.workspaceAiCredential.create({
      data: {
        workspaceId: workspace.id,
        provider: "chatgpt",
        encryptedApiKey: "enc:v1:invalid:invalid:invalid",
      },
    });

    await expect(getProviderApiKey(workspace.id, "chatgpt")).resolves.toBe("");
    const status = await getCredentialsStatus(workspace.id);

    expect(status.chatgpt.configured).toBe(false);
    expect(status.chatgpt.hasStoredKey).toBe(false);
    expect(status.chatgpt.testStatus).toBe("invalid");
    expect(status.chatgpt.testError).toContain("重新儲存");
  });

  it("falls back to an API provider when an old CLI provider is stored", async () => {
    const workspace = await db.workspace.create({
      data: { id: "ai-cli-workspace", name: "AI CLI Workspace", slug: "ai-cli-workspace" },
    });
    await db.workspaceAiSetting.create({
      data: {
        workspaceId: workspace.id,
        provider: "codex_cli",
        model: "auto",
        reasoningEffort: "medium",
        thinkingLevel: "medium",
      },
    });

    await expect(getWorkspaceAiSetting(workspace.id)).resolves.toMatchObject({
      provider: "chatgpt",
      model: "gpt-5.5",
    });
  });

  it("allows CLI providers when local CLI mode is explicitly enabled", async () => {
    vi.stubEnv("AI_ENABLE_LOCAL_CLI", "true");
    const workspace = await db.workspace.create({
      data: { id: "ai-local-cli-workspace", name: "AI Local CLI Workspace", slug: "ai-local-cli-workspace" },
    });
    await db.workspaceAiSetting.create({
      data: {
        workspaceId: workspace.id,
        provider: "codex_cli",
        model: "auto",
        reasoningEffort: "medium",
        thinkingLevel: "medium",
      },
    });

    await expect(getWorkspaceAiSetting(workspace.id)).resolves.toMatchObject({
      provider: "codex_cli",
      model: "auto",
    });
    expect(isLocalAiCliEnabled()).toBe(true);

    const status = await getCredentialsStatus(workspace.id);
    expect(status.codex_cli.configured).toBe(true);
    expect(status.codex_cli.testStatus).toBe("local");
  });
});
