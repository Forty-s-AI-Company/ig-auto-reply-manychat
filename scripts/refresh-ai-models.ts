import { refreshAllAiModels } from "@/lib/ai/providers";
import { getDb } from "@/lib/db";
import { loadProjectEnv } from "./load-env.mjs";

loadProjectEnv();

async function main() {
  const workspaces = await getDb().workspace.findMany({
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  const workspaceIds = workspaces.length ? workspaces.map((workspace) => workspace.id) : [null];
  const results: Record<string, Awaited<ReturnType<typeof refreshAllAiModels>>> = {};

  for (const workspaceId of workspaceIds) {
    results[workspaceId || "default"] = await refreshAllAiModels(workspaceId);
  }

  console.log(`[ai-models] refreshed ${JSON.stringify(results)}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getDb().$disconnect();
  });
