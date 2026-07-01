import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("inbox tag creation affordance", () => {
  it("opens the shared tag creation dialog from the inbox sidebar", () => {
    const inboxClient = readFileSync("src/components/InboxClient.tsx", "utf8");
    const tagButton = readFileSync("src/components/ContactTagCreateButton.tsx", "utf8");

    expect(inboxClient).toContain("<ContactTagCreateButton");
    expect(inboxClient).toContain('buttonLabel="建立收件匣標籤"');
    expect(inboxClient).not.toContain('aria-label="前往聯絡人管理標籤"');
    expect(inboxClient).not.toContain('title="前往聯絡人管理標籤"');

    expect(tagButton).toContain('name="tagName"');
    expect(tagButton).toContain('autoComplete="off"');
    expect(tagButton).toContain('name="tagColor"');
    expect(tagButton).toContain('"儲存中…"');
  });
});
