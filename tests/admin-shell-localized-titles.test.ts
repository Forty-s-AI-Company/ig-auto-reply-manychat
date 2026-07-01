import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("admin shell localized titles", () => {
  it("keeps secondary admin surfaces localized in Traditional Chinese", () => {
    const tagsPage = readFileSync("src/app/tags/page.tsx", "utf8");
    const knowledgeBasePage = readFileSync("src/app/knowledge-base/page.tsx", "utf8");

    expect(tagsPage).toContain('AdminShell title="標籤管理"');
    expect(tagsPage).not.toContain('AdminShell title="Tags"');
    expect(knowledgeBasePage).toContain('AdminShell title="知識庫"');
    expect(knowledgeBasePage).not.toContain('AdminShell title="Knowledge Base"');
  });
});
