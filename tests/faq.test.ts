import { describe, expect, it } from "vitest";
import { fallbackFaqReply, pickBestKnowledgeItem } from "@/lib/ai/faq";

describe("fallback AI FAQ retrieval", () => {
  const items = [
    { id: "a", title: "付款方式", content: "支援信用卡與轉帳。" },
    { id: "b", title: "領取資料", content: "使用者想領取資料時，請提供下載連結。" },
  ];

  it("picks relevant knowledge item", () => {
    expect(pickBestKnowledgeItem("我要領取資料", items)?.id).toBe("b");
  });

  it("returns deterministic fallback text", () => {
    expect(fallbackFaqReply("我要領取資料", items)).toContain("領取資料");
  });
});
