export type Sbl09Finding = {
  category: string;
  pattern: string;
  excerpt: string;
};

export type Sbl09ScanOptions = {
  allowUnsafeFixtureMarkers?: boolean;
};

const sensitivePatterns: Array<{ category: string; pattern: RegExp }> = [
  { category: "token", pattern: /\b(access_token|refresh_token)\s*[:=]\s*(?!\[REDACTED_TOKEN\])["']?[^"',\s}]+/i },
  { category: "authorization_code", pattern: /\b(authorization_code|code)\s*[:=]\s*(?!\[REDACTED_CODE\])["']?[^"',\s}]+/i },
  { category: "secret", pattern: /\b(app_secret|client_secret|verify_token)\s*[:=]\s*(?!\[REDACTED_SECRET\])["']?[^"',\s}]+/i },
  { category: "raw_state", pattern: /\bstate\s*[:=]\s*(?!\[REDACTED_STATE\])["']?[^"',\s}]+/i },
  { category: "raw_nonce", pattern: /\bnonce\s*[:=]\s*(?!\[REDACTED_NONCE\])["']?[^"',\s}]+/i },
  { category: "callback_url", pattern: /https?:\/\/[^\s"']+\/callback\?[^\s"']+/i },
  { category: "authorize_url", pattern: /https?:\/\/[^\s"']+\/dialog\/oauth\?[^\s"']+/i },
  { category: "graph_url", pattern: /https?:\/\/graph\.facebook\.com\/[^\s"']+/i },
  { category: "unmasked_business_id", pattern: /\bbusinessId\s*[:=]\s*["']?\d{6,}/i },
  { category: "unmasked_page_id", pattern: /\bpageId\s*[:=]\s*["']?\d{6,}/i },
  { category: "unmasked_instagram_id", pattern: /\binstagramAccountId\s*[:=]\s*["']?\d{6,}/i },
];

const unsafeFixturePattern = /\b(UNSAFE_FAKE_|LEAK_TEST_FAKE_|SHOULD_FAIL_FAKE_)[A-Z0-9_]+/g;

export function scanSbl09TextForSensitiveValues(text: string, options: Sbl09ScanOptions = {}): Sbl09Finding[] {
  const findings: Sbl09Finding[] = [];

  for (const { category, pattern } of sensitivePatterns) {
    const match = text.match(pattern);
    if (match?.[0]) {
      findings.push({
        category,
        pattern: pattern.source,
        excerpt: match[0].slice(0, 80),
      });
    }
  }

  if (!options.allowUnsafeFixtureMarkers) {
    const unsafeMatch = text.match(unsafeFixturePattern);
    if (unsafeMatch?.[0]) {
      findings.push({
        category: "unsafe_fixture_marker",
        pattern: unsafeFixturePattern.source,
        excerpt: unsafeMatch[0],
      });
    }
  }

  return findings;
}

export function assertSbl09Redacted(text: string, options: Sbl09ScanOptions = {}): void {
  const findings = scanSbl09TextForSensitiveValues(text, options);
  if (findings.length > 0) {
    throw new Error(`SBL-09 redaction failed: ${JSON.stringify(findings, null, 2)}`);
  }
}

export type Sbl09DryRunPayload = {
  mode: string;
  provider: string;
  workspace: { id: string; allowlisted: boolean };
  auth: {
    state: string;
    nonce: string;
    code: string;
    exchangeAttempted: boolean;
  };
  selection: {
    businessId: string;
    pageId: string;
    instagramAccountId: string;
  };
  writes: Record<string, boolean>;
  result: { status: string; errorType: string | null };
};

export function validateSbl09DryRunPayload(payload: Sbl09DryRunPayload): string[] {
  const errors: string[] = [];

  if (payload.mode !== "dry_run") errors.push("mode_must_be_dry_run");
  if (payload.provider !== "meta-business-login-sandbox") errors.push("provider_must_be_sandbox");
  if (!/^workspace_[A-Za-z0-9]+$/.test(payload.workspace.id)) errors.push("workspace_id_must_be_masked");
  if (payload.auth.state !== "[REDACTED_STATE]") errors.push("state_must_be_redacted");
  if (payload.auth.nonce !== "[REDACTED_NONCE]") errors.push("nonce_must_be_redacted");
  if (payload.auth.code !== "[REDACTED_CODE]") errors.push("code_must_be_redacted");
  if (payload.auth.exchangeAttempted !== false) errors.push("exchange_must_not_be_attempted");
  if (!/^business_[A-Za-z0-9]+$/.test(payload.selection.businessId)) errors.push("business_id_must_be_masked");
  if (!/^page_[A-Za-z0-9]+$/.test(payload.selection.pageId)) errors.push("page_id_must_be_masked");
  if (!/^ig_[A-Za-z0-9]+$/.test(payload.selection.instagramAccountId)) errors.push("instagram_id_must_be_masked");

  for (const [key, value] of Object.entries(payload.writes)) {
    if (value !== false) errors.push(`write_flag_must_be_false:${key}`);
  }

  if (!payload.result.status) errors.push("result_status_required");

  return errors;
}

export type Sbl09WriteGuardFixture = {
  fixtureId: string;
  area: string;
  safety: string;
  input: {
    mode: string;
    provider: string;
    operation: string;
  };
  expected: {
    allowed: boolean;
    errorType: string;
    wouldCreateConnectedAccount: boolean;
    wouldCreateChannel: boolean;
  };
};

const guardedOperations = new Set([
  "connectedAccount.create",
  "connectedAccount.updateToken",
  "channel.create",
  "channel.update",
  "webhook.register",
  "channel.sync",
  "token.refresh",
]);

export function validateSbl09WriteGuardFixture(fixture: Sbl09WriteGuardFixture): string[] {
  const errors: string[] = [];

  if (fixture.area !== "write-guard") errors.push("area_must_be_write_guard");
  if (fixture.safety !== "safe") errors.push("write_guard_fixture_must_be_safe");
  if (fixture.input.mode !== "dry_run") errors.push("mode_must_be_dry_run");
  if (fixture.input.provider !== "meta-business-login-sandbox") errors.push("provider_must_be_sandbox");
  if (!guardedOperations.has(fixture.input.operation)) errors.push("operation_must_be_guarded");
  if (fixture.expected.allowed !== false) errors.push("production_write_must_be_blocked");
  if (fixture.expected.errorType !== "production_write_blocked") errors.push("error_type_must_be_production_write_blocked");
  if (fixture.expected.wouldCreateConnectedAccount !== false) errors.push("connected_account_create_must_be_false");
  if (fixture.expected.wouldCreateChannel !== false) errors.push("channel_create_must_be_false");

  return errors;
}
