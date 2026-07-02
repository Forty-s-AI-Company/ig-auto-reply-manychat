# Meta Business Login Sandbox SBL-13 Workspace Linking / Channel Sync Dry-Run

Date: 2026-06-16
Status: Pass for dry-run validation / Hold for internal beta

## Scope

SBL-13 validates that redacted sandbox callback evidence can be mapped into workspace linking and channel sync drafts without creating production records.

This validation does not:

- perform Meta token exchange
- store token
- create or update ConnectedAccount
- create or update Channel
- register webhook
- start channel sync
- change OAuth flow
- change callback route
- change login button
- change env
- change Prisma schema

## Input Evidence

Input is the already-redacted sandbox callback evidence:

```text
mode: sandbox_callback_capture
status: success
providerId: meta-business-instagram-sandbox
code: [REDACTED_CODE]
state: [REDACTED_STATE]
callbackUrl: [REDACTED_CALLBACK_URL]
exchangeAttempted: false
productionWrites: all false
```

No raw authorization code, raw state, token, secret, nonce, or full callback URL is used by the dry-run mapping.

## Workspace Linking Draft

Expected dry-run draft:

```text
mode: sandbox_workspace_linking_dry_run
providerId: meta-business-instagram-sandbox
workspaceId: workspace_[hash]
requestId: req_[hash]
connectedAccountDraft.wouldCreate: false
connectedAccountDraft.tokenStored: false
channelDraft.wouldCreate: false
channelDraft.syncMode: dry_run
```

Selected Business / Page / IG account IDs must be hashed before appearing in the draft.

## Channel Sync Dry-Run

Expected channel sync dry-run:

```text
wouldStart: false
selectedBusinessId: business_[hash] / null
selectedPageId: page_[hash] / null
selectedInstagramAccountId: ig_[hash] / null
requestedOperations:
  - profile_read
  - message_capability_check
  - comment_capability_check
  - insights_capability_check
tokenRequiredButNotPresent: true
```

## Production Write Guard

Guarded operations:

```text
connectedAccount.create
connectedAccount.updateToken
channel.create
channel.update
webhook.register
channel.sync
token.refresh
```

Expected result:

```text
blocked: true
attemptedWrites: []
```

## Redaction Result

The dry-run payload must not contain:

- raw authorization code
- raw state
- raw nonce
- full callback URL
- access token
- refresh token
- app secret
- client secret
- unmasked Business ID
- unmasked Page ID
- unmasked Instagram account ID

## Targeted Test

```bash
npx vitest run tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts
```

Result:

```text
1 test file passed
2 tests passed
```

## Gate Result

| Gate | Status | Notes |
| --- | --- | --- |
| Callback evidence mapping | Pass | Redacted callback evidence maps to dry-run draft. |
| Workspace linking draft | Pass | No ConnectedAccount write. |
| Channel sync draft | Pass | No channel sync started. |
| Production write guard | Pass | All guarded operations blocked. |
| Redaction | Pass | No sensitive values in tested payload. |
| Internal beta | Hold | Still requires manual go/no-go review and App Review readiness. |
| Production implementation | No-Go | Still requires App Review and production implementation ADR / rollout gates. |
