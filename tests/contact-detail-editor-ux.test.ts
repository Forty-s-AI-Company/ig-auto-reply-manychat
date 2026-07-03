import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const source = readFileSync(join(process.cwd(), "src/components/ContactDetailEditor.tsx"), "utf8");

describe("ContactDetailEditor UX affordances", () => {
  it("explains why the tag controls are disabled when all tags are already applied", () => {
    expect(source).toContain("contact-detail-tag-disabled-reason");
    expect(source).toContain("這個聯絡人已套用所有標籤");
    expect(source).toContain("aria-describedby={tagDisabledReason ? \"contact-detail-tag-disabled-reason\" : undefined}");
    expect(source).toContain("title={tagDisabledReason || undefined}");
  });

  it("keeps detail actions keyboard-visible and touch-friendly", () => {
    expect(source).toContain("focus-visible:ring-[#006fe6]");
    expect(source).toContain("flex flex-col gap-2 sm:flex-row");
    expect(source).toContain("inline-flex h-6 w-6");
    expect(source).toContain("focus-visible:ring-white");
  });

  it("explains why save and cancel actions are disabled before edits", () => {
    expect(source).toContain("contact-detail-action-disabled-reason");
    expect(source).toContain("目前沒有未儲存的變更");
    expect(source).toContain('aria-describedby={actionDisabledReason ? "contact-detail-action-disabled-reason" : undefined}');
    expect(source).toContain("title={actionDisabledReason || undefined}");
  });

  it("announces error toasts as alerts instead of passive status text", () => {
    expect(source).toContain('role={toast.tone === "danger" ? "alert" : "status"}');
    expect(source).toContain('aria-live="polite"');
  });
});
