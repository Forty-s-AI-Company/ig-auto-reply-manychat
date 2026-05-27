import { PrismaClient } from "@prisma/client";
import { loadProjectEnv } from "./load-env.mjs";

loadProjectEnv();

const prisma = new PrismaClient();
const workspaceId = "default-workspace";

const mainReplyText =
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

async function main() {
  await prisma.job.deleteMany({ where: { workspaceId } });
  await prisma.automationRun.deleteMany({ where: { automation: { workspaceId } } });
  await prisma.automationStep.deleteMany({ where: { automation: { workspaceId } } });
  await prisma.automation.deleteMany({ where: { workspaceId } });

  await prisma.automation.create({
    data: {
      workspaceId,
      name: "Canva變現",
      enabled: true,
      triggerType: "keyword",
      triggerConfigJson: {
        keywords: ["canva", "學習", "学习", "can", "tips", "tip"],
        match: "contains",
        postSelectionMode: "specific",
        selectedPostId: "18364012081230832",
        selectedPostLabel: "測試",
        delayEnabled: false,
        delaySeconds: 0,
        autoLike: true,
        publicReplyEnabled: true,
        publicReplyText: "私訊傳給你囉，請記得追蹤我，以免收不到訊息！",
        flow: {
          nodes: [
            { id: "trigger", position: { x: 40, y: 220 } },
            { id: "step-1", position: { x: 330, y: 220 } },
            { id: "step-2", position: { x: 630, y: 140 } },
            { id: "step-3", position: { x: 930, y: 140 } },
            { id: "step-4", position: { x: 1230, y: 140 } },
          ],
          edges: [
            { id: "edge-trigger-keywords", source: "trigger", target: "step-1", animated: true, style: { strokeWidth: 2 } },
            { id: "edge-keywords-dm", source: "step-1", target: "step-2", animated: true, style: { strokeWidth: 2 } },
            { id: "edge-dm-tag", source: "step-2", target: "step-3", animated: true, style: { strokeWidth: 2 } },
            { id: "edge-tag-source", source: "step-3", target: "step-4", animated: true, style: { strokeWidth: 2 } },
          ],
        },
      },
      steps: {
        create: [
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
            configJson: { title: "留言後私訊主內容", text: mainReplyText },
          },
          { order: 3, type: "add_tag", configJson: { title: "標記 Canva 名單", tagName: "canva-lead" } },
          {
            order: 4,
            type: "set_field",
            configJson: { title: "記錄來源", field: "locale", value: "Canva變現留言自動化" },
          },
        ],
      },
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
