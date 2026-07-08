import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("tags manager UI", () => {
  const pageSource = readFileSync("src/app/tags/page.tsx", "utf8");
  const clientSource = readFileSync("src/components/TagsManagerClient.tsx", "utf8");

  it("uses a polished SaaS tag manager instead of the raw JSON CRUD surface", () => {
    expect(pageSource).toContain("TagsManagerClient");
    expect(pageSource).not.toContain("JsonCrudClient");
    expect(clientSource).toContain("建立標籤");
    expect(clientSource).toContain("目前標籤");
    expect(clientSource).toContain("標籤名稱");
    expect(clientSource).toContain("顏色");
    expect(clientSource).toContain("編輯");
    expect(clientSource).toContain("刪除");
    expect(clientSource).not.toContain("Raw JSON");
    expect(clientSource).not.toContain("monaco");
    expect(clientSource).not.toContain("textarea");
  });

  it("keeps tag create, edit, and delete actions wired to the existing scoped API", () => {
    expect(clientSource).toContain('fetch("/api/tags"');
    expect(clientSource).toContain('method: "POST"');
    expect(clientSource).toContain('fetch(`/api/tags/${tagId}`');
    expect(clientSource).toContain('method: "PATCH"');
    expect(clientSource).toContain('fetch(`/api/tags/${tag.id}`, { method: "DELETE" })');
    expect(clientSource).toContain("router.refresh()");
  });
});
