import { describe, expect, it } from "vitest";

import validDryRunFixture from "./fixtures/sbl09/safe/sbl09.callback.valid-dry-run.expected-redacted.fixture.json";
import writeGuardFixture from "./fixtures/sbl09/safe/sbl09.write-guard.channel-create-blocked.safe.fixture.json";
import unsafeRedactionFixture from "./fixtures/sbl09/unsafe/sbl09.redaction.raw-code.unsafe.fixture.json";
import {
  assertSbl09Redacted,
  scanSbl09TextForSensitiveValues,
  validateSbl09DryRunPayload,
  validateSbl09WriteGuardFixture,
  type Sbl09DryRunPayload,
  type Sbl09WriteGuardFixture,
} from "./helpers/sbl09-redaction";

describe("SBL-09 Meta Business Login sandbox test scaffold", () => {
  it("keeps safe fixtures and dry-run snapshots fully redacted", () => {
    expect(() => assertSbl09Redacted(JSON.stringify(validDryRunFixture))).not.toThrow();
    expect(validateSbl09DryRunPayload(validDryRunFixture.payload as Sbl09DryRunPayload)).toEqual([]);
  });

  it("detects unsafe fixture markers before they can enter logs or reports", () => {
    const findings = scanSbl09TextForSensitiveValues(JSON.stringify(unsafeRedactionFixture));

    expect(findings.map((finding) => finding.category)).toContain("unsafe_fixture_marker");
  });

  it("allows unsafe markers only when explicitly scanning a negative fixture", () => {
    const findings = scanSbl09TextForSensitiveValues(JSON.stringify(unsafeRedactionFixture), {
      allowUnsafeFixtureMarkers: true,
    });

    expect(findings).toEqual([]);
  });

  it("rejects raw callback URLs and reusable authorize URLs", () => {
    const rawEvidence = [
      "https://app.example.com/api/meta/oauth/callback?code=SHOULD_FAIL_FAKE_CODE&state=SHOULD_FAIL_FAKE_STATE",
      "https://www.facebook.com/dialog/oauth?client_id=123&redirect_uri=https://app.example.com/callback&state=SHOULD_FAIL_FAKE_STATE",
    ].join("\n");

    const findings = scanSbl09TextForSensitiveValues(rawEvidence, {
      allowUnsafeFixtureMarkers: true,
    });

    expect(findings.map((finding) => finding.category)).toEqual(expect.arrayContaining(["callback_url", "authorize_url"]));
  });

  it("blocks production write guard fixtures by default", () => {
    expect(validateSbl09WriteGuardFixture(writeGuardFixture as Sbl09WriteGuardFixture)).toEqual([]);
  });

  it("fails a production write guard fixture that would allow Channel creation", () => {
    const unsafeWriteGuard = {
      ...writeGuardFixture,
      expected: {
        ...writeGuardFixture.expected,
        allowed: true,
        wouldCreateChannel: true,
      },
    };

    expect(validateSbl09WriteGuardFixture(unsafeWriteGuard as Sbl09WriteGuardFixture)).toEqual(
      expect.arrayContaining(["production_write_must_be_blocked", "channel_create_must_be_false"]),
    );
  });

  it("defines the minimum guarded production operations for future fixtures", () => {
    const operations = [
      "connectedAccount.create",
      "connectedAccount.updateToken",
      "channel.create",
      "channel.update",
      "webhook.register",
      "channel.sync",
      "token.refresh",
    ];

    for (const operation of operations) {
      const fixture = {
        ...writeGuardFixture,
        input: {
          ...writeGuardFixture.input,
          operation,
        },
      };

      expect(validateSbl09WriteGuardFixture(fixture as Sbl09WriteGuardFixture)).toEqual([]);
    }
  });
});
