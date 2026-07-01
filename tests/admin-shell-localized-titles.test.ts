import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("admin shell localized titles", () => {
  it("keeps secondary admin surfaces localized in Traditional Chinese", () => {
    const tagsPage = readFileSync("src/app/tags/page.tsx", "utf8");
    const knowledgeBasePage = readFileSync("src/app/knowledge-base/page.tsx", "utf8");
    const aiSettingsPage = readFileSync("src/app/ai-settings/page.tsx", "utf8");
    const segmentsPage = readFileSync("src/app/segments/page.tsx", "utf8");
    const instagramDefaultReplyPage = readFileSync("src/app/automations/instagram-default-reply/page.tsx", "utf8");
    const adminPayoutsPage = readFileSync("src/app/admin/payouts/page.tsx", "utf8");
    const adminPayoutBatchesPage = readFileSync("src/app/admin/payouts/batches/page.tsx", "utf8");
    const adminAffiliatesPage = readFileSync("src/app/admin/affiliates/page.tsx", "utf8");

    expect(tagsPage).toContain('AdminShell title="標籤管理"');
    expect(tagsPage).not.toContain('AdminShell title="Tags"');
    expect(knowledgeBasePage).toContain('AdminShell title="知識庫"');
    expect(knowledgeBasePage).not.toContain('AdminShell title="Knowledge Base"');
    expect(aiSettingsPage).toContain('AdminShell title="AI 設定"');
    expect(aiSettingsPage).not.toContain('AdminShell title="InboxPilot AI"');
    expect(segmentsPage).toContain('AdminShell title="分眾名單"');
    expect(segmentsPage).not.toContain('AdminShell title="Segments"');
    expect(instagramDefaultReplyPage).toContain('AdminShell title="Instagram 預設回覆"');
    expect(instagramDefaultReplyPage).not.toContain('AdminShell title="Instagram Default Reply"');
    expect(adminPayoutsPage).toContain('AdminShell title="提領管理"');
    expect(adminPayoutsPage).not.toContain('AdminShell title="Admin Payouts"');
    expect(adminPayoutsPage).not.toContain(">Batches<");
    expect(adminPayoutBatchesPage).toContain('AdminShell title="提領批次"');
    expect(adminPayoutBatchesPage).not.toContain('AdminShell title="Payout Batches"');
    expect(adminAffiliatesPage).toContain('AdminShell title="聯盟夥伴管理"');
    expect(adminAffiliatesPage).not.toContain('AdminShell title="Admin Affiliates"');
    expect(adminAffiliatesPage).not.toContain(">Approve<");
    expect(adminAffiliatesPage).not.toContain(">Reject<");
  });
});
