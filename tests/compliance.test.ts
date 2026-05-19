import { describe, expect, it } from "vitest";
import { filterBroadcastRecipients } from "@/lib/compliance";

describe("broadcast compliance filter", () => {
  it("only keeps opted_in contacts with target tag", () => {
    const recipients = filterBroadcastRecipients(
      [
        { id: "1", channelId: "c1", consentStatus: "opted_in", tags: [{ tagId: "lead" }] },
        { id: "2", channelId: "c1", consentStatus: "unknown", tags: [{ tagId: "lead" }] },
        { id: "3", channelId: "c1", consentStatus: "opted_in", tags: [{ tagId: "other" }] },
      ],
      "lead",
    );

    expect(recipients.map((item) => item.id)).toEqual(["1"]);
  });
});
