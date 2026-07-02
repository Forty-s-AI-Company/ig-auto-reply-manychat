# Meta Business Login Sandbox Internal Beta Go/No-Go Review

Date: 2026-06-16
Status: Hold before internal beta / No-Go for production implementation

## Scope

This review summarizes whether the Meta Business Login sandbox can move from sandbox validation into internal beta preparation.

This review does not approve production implementation.

No product functionality was changed for this review. It does not change:

- OAuth flow
- callback route
- login button
- environment variables
- Prisma schema
- production ConnectedAccount / Channel writes
- real Meta token exchange

## Decision Summary

```text
Account selection UX: Pass
Consent screen: Pass
Redacted callback evidence: Pass
Workspace linking dry-run: Pass
Channel sync dry-run: Pass
Production write guard: Pass
Redaction: Pass
App Review readiness: Hold
Rollback / fallback readiness: Partial Pass
Internal beta: Hold
Production implementation: No-Go
```

Recommendation:

```text
Do not enter internal beta automatically.
Proceed to a manual internal beta readiness review after App Review demo materials, reviewer-facing recording plan, and rollback runbook are finalized.
```

## 1. App Review Readiness

Current status: Hold.

Evidence:

```text
docs/meta-business-login-app-review-demo-script.md
docs/meta-app-review-checklist.md
docs/meta-business-login-sandbox-controlled-consent-run-2026-06-16.md
docs/meta-business-login-sandbox-sbl13-workspace-linking-sync-dry-run.md
```

Ready items:

- Instagram Business Login app name appeared on the consent screen.
- Privacy policy link appeared on the consent screen.
- Terms of service link appeared on the consent screen.
- Account selection UX was observed.
- Redacted callback evidence was captured.
- Workspace linking and channel sync can be represented as dry-run drafts.

Blocking items before internal beta:

- Final reviewer-facing demo recording is not yet captured.
- Permission-by-permission reviewer proof still needs a final pass against current Meta App Dashboard permissions.
- Business / Page / IG test asset ownership and reviewer account access still need final confirmation.
- App Review submission package is not yet finalized.

Decision:

```text
App Review readiness: Hold
Reason: evidence exists, but final reviewer demo package and permission proof are not complete.
```

## 2. Account Selection UX Evidence

Current status: Pass.

Evidence:

```text
docs/meta-business-login-sandbox-oauth-profile-selection-run-2026-06-16.md
docs/meta-business-login-sandbox-controlled-consent-run-2026-06-16.md
```

Observed behavior:

- Instagram Business Login showed login / profile selection.
- Multiple Instagram profiles were shown.
- A use-another-profile option was shown.
- This is close to the ManyChat-style account selection expectation.

Known limitation:

- `force_reauth=true` forced account/profile selection, but in the observed browser run it returned to Instagram home after selecting a profile.
- Without `force_reauth=true`, the flow reached the consent screen after a profile session existed.

Decision:

```text
Account selection UX: Pass
ManyChat UX proximity: Partially close to close
Reason: profile selection is available, but exact continuation behavior differs by `force_reauth` state.
```

## 3. Callback Evidence

Current status: Pass.

Evidence:

```text
docs/meta-business-login-sandbox-controlled-consent-run-2026-06-16.md
```

Captured callback result:

```text
mode: sandbox_callback_capture
status: success
providerId: meta-business-instagram-sandbox
code: [REDACTED_CODE]
state: [REDACTED_STATE]
callbackUrl: [REDACTED_CALLBACK_URL]
errorType: null
exchangeAttempted: false
productionWrites:
  connectedAccount: false
  channel: false
  webhook: false
  channelSync: false
  tokenRefresh: false
```

Decision:

```text
Callback evidence: Pass
Reason: user-authorized callback returned redacted sandbox evidence without token exchange or production writes.
```

## 4. Workspace Linking Dry-Run Evidence

Current status: Pass.

Evidence:

```text
docs/meta-business-login-sandbox-sbl13-workspace-linking-sync-dry-run.md
src/lib/meta-business-sandbox-workspace-linking.ts
tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts
```

Validated behavior:

- Redacted callback evidence maps to `sandbox_workspace_linking_dry_run`.
- Workspace ID is hashed.
- Request ID is hashed.
- ConnectedAccount draft keeps `wouldCreate=false`.
- Token storage remains disabled with `tokenStored=false`.
- Selected Business / Page / IG asset IDs are hashed before appearing in the draft.

Decision:

```text
Workspace linking dry-run: Pass
Reason: linking can be represented safely without production writes or token storage.
```

## 5. Channel Sync Dry-Run Evidence

Current status: Pass.

Evidence:

```text
docs/meta-business-login-sandbox-sbl13-workspace-linking-sync-dry-run.md
tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts
```

Validated behavior:

```text
channelDraft.wouldCreate: false
channelDraft.syncMode: dry_run
channelSyncDryRun.wouldStart: false
channelSyncDryRun.tokenRequiredButNotPresent: true
```

Requested dry-run operations:

- profile read check
- message capability check
- comment capability check
- insights capability check

Decision:

```text
Channel sync dry-run: Pass
Reason: sync intent can be represented without starting sync or requiring token material.
```

## 6. Redaction Evidence

Current status: Pass.

Evidence:

```text
docs/meta-business-login-sandbox-controlled-consent-run-2026-06-16.md
docs/meta-business-login-sandbox-sbl13-workspace-linking-sync-dry-run.md
tests/meta-business-login-sandbox-sbl12-callback-capture.test.ts
tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts
```

Confirmed absent from tested payloads and documents:

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

Decision:

```text
Redaction: Pass
Reason: callback and dry-run payloads keep sensitive values redacted or hashed.
```

## 7. Production Write Guard Evidence

Current status: Pass.

Evidence:

```text
src/lib/meta-business-sandbox-write-guard.ts
tests/meta-business-login-sandbox-sbl08.test.ts
tests/meta-business-login-sandbox-sbl13-workspace-linking-sync.test.ts
```

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

Validated result:

```text
blocked: true
attemptedWrites: []
```

Decision:

```text
Production write guard: Pass
Reason: sandbox dry-run evidence blocks all production write classes.
```

## 8. Rollback / Fallback Readiness

Current status: Partial Pass.

Fallback currently available:

- Existing production Instagram OAuth flow remains available.
- Sandbox provider is separate from production provider identity.
- Login button was not changed.
- Env was not changed.
- Prisma schema was not changed.
- Production implementation remains blocked.

Remaining rollback work before internal beta:

- Define explicit feature flag or internal-only access control for any beta entry point.
- Define cleanup steps for any beta-only sandbox records if future internal beta writes are introduced.
- Define monitoring checks for unexpected token exchange or production Channel writes.
- Define one-command disable / rollback instruction for beta entry points.

Decision:

```text
Rollback / fallback readiness: Partial Pass
Reason: production fallback is intact, but internal beta rollback runbook still needs final operational steps.
```

## 9. Internal Beta Decision

Decision:

```text
Internal beta: Hold
```

Reason:

- Core sandbox evidence is now strong enough to prepare an internal beta review.
- However, internal beta should not start until the App Review demo package, reviewer recording, internal-only beta access controls, and rollback runbook are finalized.

Minimum conditions to move from Hold to Go:

1. Final App Review demo script and recording checklist are approved.
2. Permission usage table is reconciled with current Meta App Dashboard permissions.
3. Internal beta entry point is explicitly internal-only and access-controlled.
4. Rollback / disable procedure is documented and tested.
5. Redaction search is run after any beta evidence capture.
6. Product owner signs off that beta will not create production ConnectedAccount / Channel unless a separate implementation task explicitly approves it.

## 10. Why Production Implementation Remains No-Go

Decision:

```text
Production implementation: No-Go
```

Reasons:

- App Review is not submitted or approved.
- Production env migration plan is not approved.
- Production callback behavior for real token exchange is not designed for Business Login.
- Production ConnectedAccount / Channel write path is not implemented or reviewed for this provider.
- Workspace / tenant isolation for real Business / Page / IG asset writes has not been regression-tested.
- Token storage, refresh, webhook registration, and channel sync lifecycle are not approved for this provider.
- Rollback and monitoring for production rollout are not complete.

## Final Review Result

```text
Go to internal beta: No
Hold before internal beta: Yes
Go to production implementation: No

Main reason:
Sandbox evidence is sufficient for an internal beta readiness review, but not enough to begin internal beta or production implementation.

Next step:
Finalize App Review demo materials and internal beta access / rollback runbook.
```
