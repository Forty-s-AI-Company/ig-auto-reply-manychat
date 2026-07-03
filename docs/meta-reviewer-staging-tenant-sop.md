# Meta Reviewer-Safe Staging Tenant SOP

Last updated: 2026-07-03 (staging tenant + connected Instagram channel + Inbox / Contacts / Automations evidence verified).

## Purpose

This SOP defines the manual, reviewer-safe staging flow used to rehearse or capture Meta App Review evidence without touching production data.

It is intentionally limited to:

- reviewer-safe staging login preparation
- reviewer-safe synthetic-only workspace preparation
- reviewer-safe Instagram asset lane planning
- pre-recording validation
- post-review cleanup

This SOP does **not** authorize:

- Meta App Review submission
- Meta Dashboard writes
- production deployment
- production database access

## Preconditions

Do not start this SOP unless all of these are true:

- Local reviewer rehearsal is already green:
  - `npm run e2e:reviewer:ensure`
  - `npm run test:e2e:reviewer`
- Staging runtime is healthy:
  - `/api/health/staging`
- Operator can provide reviewer-safe credentials through a secure handoff channel.
- Operator can guarantee that the staging tenant contains synthetic data only.

If any of these are not true, stay in local rehearsal mode and do not claim staging evidence readiness.

## Inputs

Prepare these inputs outside git and outside project docs:

1. Reviewer-safe staging login label
2. Secure password handoff method
3. Reviewer-safe workspace label
4. Reviewer-safe Instagram Business / Creator asset label
5. Reviewer-safe Facebook Page label if required by the selected Meta flow
6. Cleanup owner and cleanup deadline

Only safe labels belong in documentation. Secrets never do.

## Phase 1 - Reviewer-Safe Staging Login

### Goal

Prepare a staging login that is safe for Meta reviewer rehearsal and isolated from real user data.

### Requirements

- Login must point only to the reviewer-safe staging tenant.
- Login must not expose admin-only, payout, DB, or customer-facing internal surfaces unless explicitly required.
- Login must be temporary or revocable.
- Credentials must be handed off through a secure out-of-band method only.

### Checklist

- `[x]` Reviewer-safe staging user exists via app-layer signup.
- `[x]` User has access only to the reviewer-safe workspace.
- `[ ]` User does not inherit production or operator-wide access.
- `[ ]` Password or login method is ready for secure handoff.
- `[ ]` Revocation plan is defined.

## Phase 2 - Reviewer-Safe Synthetic-Only Workspace

### Goal

Prepare one staging workspace that contains only synthetic reviewer-safe data.

### Minimum workspace contents

- One workspace label:
  - `InboxPilot Review Workspace`
- One synthetic contact:
  - `Meta Reviewer Test Contact`
- One synthetic conversation:
  - `Hi, I want product information.`
- One simple automation draft:
  - `Meta Review Keyword Reply`

### Workspace rules

- No real customer messages
- No real customer names
- No real customer phone/email/address
- No real billing or payout records
- No mixed operator/customer data

### Checklist

- `[x]` Workspace exists on staging.
- `[x]` Workspace contains synthetic-only workspace state.
- `[ ]` Workspace does not expose unrelated tenants.
- `[x]` Inbox and Contacts show reviewer-safe seeded content.
- `[x]` Automations shows a reviewer-safe draft (`Meta Review Keyword Reply`).
- `[ ]` Empty or fallback states do not leak internal test/debug labels.

## Phase 3 - Reviewer-Safe Instagram Asset Lane

### Goal

Prepare the remote asset needed for connected-channel proof without pretending that a local synthetic channel is enough.

### Requirements

- Reviewer-safe Instagram asset must be owned or controlled by the operator/test business.
- Asset must not contain customer DMs, comments, or production customer content.
- If a Facebook Page is required, it must also be reviewer-safe.
- Asset must be suitable for the exact Meta use case under review.

### Checklist

- `[x]` Reviewer-safe Instagram asset is available.
- `[x]` Asset can complete the staging OAuth flow.
- `[x]` Asset name/handle/profile are safe for screenshots or recording.
- `[ ]` If required, the linked Facebook Page is reviewer-safe too.
- `[ ]` Operator understands this lane is still blocked if webhook setup is incomplete.

## Phase 4 - Pre-Recording Validation

### Goal

Verify that staging can be used for reviewer rehearsal without exposing unsafe data or ambiguous evidence.

### Validation steps

1. Check staging health:
   - `/api/health/staging`
2. Sign in with the reviewer-safe staging user.
3. Confirm the user lands in the intended reviewer-safe workspace.
4. Open:
   - Dashboard
   - Channels / Connect
   - Inbox
   - Contacts
   - Automations
5. Confirm only reviewer-safe synthetic data is visible.
6. If OAuth proof is required, start and complete the real connect flow with the reviewer-safe Instagram asset.
7. Confirm no secrets, raw callback URLs, or unrelated tenant data appear.

### Minimum validation checklist

- `[ ]` Staging health is green.
- `[x]` Reviewer-safe user can sign in.
- `[ ]` Reviewer-safe workspace is isolated.
- `[ ]` Dashboard copy is safe to record.
- `[x]` Channels / Connect flow is safe to record.
- `[x]` Inbox shows reviewer-safe conversation only.
- `[x]` Contacts shows reviewer-safe contact only.
- `[x]` Automations shows reviewer-safe draft only.
- `[x]` If connected-channel proof is required, OAuth completes safely.
- `[ ]` No raw OAuth query string, token, or debug artifact is visible.

### Hold conditions

Hold the staging rehearsal if any of these are true:

- staging user can reach unsafe data
- staging workspace contains mixed real/synthetic data
- reviewer-safe Instagram asset is not ready
- webhook / verify-token ambiguity would cause over-claiming
- operator cannot guarantee redaction-safe capture

## Phase 5 - Post-Review Cleanup

### Goal

Remove or reduce temporary reviewer-safe access after rehearsal or after Meta review completes.

### Checklist

- `[ ]` Disable or remove reviewer-safe staging user if no longer needed.
- `[ ]` Rotate any temporary password or access secret.
- `[ ]` Remove temporary app roles or workspace access.
- `[ ]` Revoke temporary Instagram/Page access if it was granted only for review.
- `[ ]` Archive the final reviewer instructions in a secret-safe place.
- `[ ]` Delete unnecessary local screenshots/recordings that contain account labels.
- `[ ]` Record cleanup completion in the launch log.

## Manual Blocker Checklist

The following blockers are expected to remain manual:

- secure reviewer-safe staging credential handoff
- reviewer-safe Facebook Page / Business linkage confirmation if the Facebook login lane is later included in submission scope
- reviewer-safe Facebook Page / Business linkage if required
- final redaction-safe capture review for the existing staging Inbox / Contacts lane
- final redaction sign-off

If any blocker is unresolved, the staging reviewer lane remains Hold even if local rehearsal is green.

## Related Documents

- `docs/meta-reviewer-staging-rehearsal-gap-audit.md`
- `docs/meta-reviewer-demo-data-prep-runbook.md`
- `docs/meta-app-review-submission-package.md`
- `docs/meta-app-review-operator-submission-workbook.md`
- `docs/meta-reviewer-test-asset-handoff-checklist.md`
