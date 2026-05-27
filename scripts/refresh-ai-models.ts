import { refreshAllAiModels } from "@/lib/ai/providers";
import { getDb } from "@/lib/db";
import { loadProjectEnv } from "./load-env.mjs";

loadProjectEnv();

async function main() {
  const workspace = await getDb().workspace.findFirst({ orderBy: { createdAt: "asc" } });
  const counts = await refreshAllAiModels(workspace?.id);
  console.log(`[ai-models] refreshed ${JSON.stringify(counts)}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getDb().$disconnect();
  });
