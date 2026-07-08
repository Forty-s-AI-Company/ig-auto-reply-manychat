# Final Human Acceptance Package

Generated: 2026-07-07

## Scope

This package is the final human acceptance handoff for InboxPilot sale-ready beta review. It does not authorize production deployment, production database mutation, Meta App Review submission, or PayUNI production switching.

## A. Passed Evidence

| Area | Status | Evidence |
| --- | --- | --- |
| Local lint | PASS | `reports/ai-team/yolo-validation.md`: `npm run lint` exit `0` |
| Local build | PASS | `reports/ai-team/yolo-validation.md`: `npm run build` exit `0` |
| Local tests | PASS | `reports/ai-team/yolo-validation.md`: `npm test` exit `0` |
| Local reviewer E2E | PASS | `reports/ai-team/yolo-validation.md`: `npm run test:e2e:reviewer` exit `0` |
| Public staging health | PASS | `reports/ai-team/STAGING_BROWSER_QA_REPORT.md`: `/api/health/staging` and `/api/health` HTTP 200 |
| Public staging desktop QA | PASS | Public landing/login/signup/pricing/legal/status routes loaded without 5xx or horizontal overflow |
| Public staging mobile QA | PASS | Public landing/login/signup/pricing/legal/status routes loaded on Pixel 5 profile without 5xx or horizontal overflow |
| Authenticated staging login | PASS | `reports/ai-team/AUTHENTICATED_STAGING_QA_REPORT.md`: signup/login HTTP 200 |
| Authenticated staging dashboard | PASS | Dashboard visible after reviewer-safe login |
| Authenticated staging inbox | PASS | Reviewer-safe synthetic conversation visible |
| Authenticated staging contacts | PASS | Reviewer-safe synthetic contact visible |
| Mock reviewer-safe data | PASS | `POST /api/webhooks/mock` HTTP 202; synthetic only, no real IG message sent |
| Public console errors | PASS | No browser console errors observed in public staging smoke |
| Public network status | PASS_WITH_NOTES | Only route-transition / Vercel overlay aborted requests observed; no product 5xx |

## B. Human Gates Not Yet Complete

| Gate | Current Status | Why Human Is Required |
| --- | --- | --- |
| Reviewer-safe IG / Meta asset lane | PASS | Reviewer-safe Instagram OAuth completed and connected channel evidence is captured across Channels, sidebar, Inbox, Contacts, and Automations. |
| PayUNI Sandbox checkout evidence | PASS | App-side checkout, return URL, entitlement, invoice, order, and merchant back-office evidence are collected. |
| Meta App Review screenshot / recording package | PASS | Fresh new-lane consent / connected-channel evidence has replaced the stale package, the final MP4 has been regenerated, and unsafe originals were moved out of the active package. |
| Business Verification / Advanced Access | HUMAN_INPUT_REQUIRED | Current status is documented, but both remain not started and still require owner decision in Meta dashboard. |
| Production deployment authorization | HUMAN_INPUT_REQUIRED | Production deploy is off by default and requires explicit owner approval. |
| PayUNI production switch | HUMAN_INPUT_REQUIRED | PayUNI remains Sandbox until separate production go-live approval. |

## C. Human Gate Step-By-Step Checklist

### 1. Reviewer-Safe IG / Meta Asset Lane

Current status:

```text
META_REVIEWER_SAFE_ASSET_LANE=PASS
CONNECTED_CHANNEL_EVIDENCE=PASS
META_APP_REVIEW_RECORDING_READY=PASS
META_LOGIN_REQUIRED=RESOLVED
```

What is already ready:

- Staging reviewer-safe login.
- Dashboard recording surface.
- Channels / Connect / Social page.
- Instagram OAuth start route.
- OAuth callback / safe error UI.
- Inbox / Contacts synthetic demo data.
- Automations demo / draft surface.
- Privacy Policy, Terms, and Data Deletion pages.
- A new clean Meta / Instagram lane now exists:
  - Parent app `1383365527078199`
  - Instagram OAuth client id `2542520412924029`
  - Display name target `InboxPilot-IG`

What still requires human operation:

- Meta Developers App Review / permission / Business Verification screenshots.
- Final MP4 redaction review.
- Final owner decision on whether to start Business Verification / Advanced Access before submit.

Execution evidence from 2026-07-06:

- Staging Channels / Connect / Social entry screenshot: `reports/ai-team/meta-review-evidence/01-staging-connect-instagram-entry.png`
- Instagram OAuth login / consent screenshot: `reports/ai-team/meta-review-evidence/02-meta-oauth-login-or-consent.png`
- OAuth success screenshot: `reports/ai-team/meta-review-evidence/06-staging-oauth-success.png`
- Connected channel screenshot: `reports/ai-team/meta-review-evidence/07-staging-channel-connected.png`
- Sidebar connected channel screenshot: `reports/ai-team/meta-review-evidence/08-sidebar-connected-channel.png`
- Inbox connected channel scope screenshot: `reports/ai-team/meta-review-evidence/09-inbox-connected-channel-scope.png`
- Contacts connected channel scope screenshot: `reports/ai-team/meta-review-evidence/10-contacts-connected-channel-scope.png`
- Automations connected channel context screenshot: `reports/ai-team/meta-review-evidence/11-automations-connected-channel-scope.png`
- Current stop reason: `BUSINESS_VERIFICATION / ADVANCED_ACCESS / FINAL_SUBMIT_AUTHORIZATION`
- Business / Page / IG asset selection: not shown in the successful new-lane reviewer-safe flow.
- Final lane note: fresh callback success now belongs to the new clean lane:
  - parent Meta app `1383365527078199`
  - Instagram OAuth client id `2542520412924029`
  - consent display name `InboxPilot-IG`

1. Use the already-working staging reviewer-safe flow and re-record it into one final MP4.
2. Start from staging login: `https://staging.carry-digital-nomad.in.net`.
3. Show Dashboard -> Channels / Connect / Social -> Instagram OAuth -> success callback.
4. Show the connected channel in:
   - Channels / settings list
   - Sidebar account dropdown
   - Inbox scope selector / current account context
   - Contacts scope / channel context
   - Automations channel context
5. Show Privacy Policy, Terms, and Data Deletion pages.
6. Confirm no real customer or personal IG user data is visible.

Pass standard:

- Connected channel is visible in staging UI.
- Channel name / username / avatar / fallback metadata are understandable.
- No raw provider error is shown.
- Evidence uses reviewer-safe assets only.
- No production message is sent.

Fields to fill after completion:

```text
Meta reviewer-safe IG account connected: YES/NO
Connected channel display name:
Connected channel screenshot path:
Sidebar dropdown screenshot path:
Inbox scope screenshot path:
Contacts scope screenshot path:
Recording path:
Remaining blocker:
```

### 2. PayUNI Sandbox Checkout Evidence

Current status:

```text
PAYUNI_SANDBOX_EVIDENCE=PASS
PAYUNI_MERCHANT_BACKOFFICE_EVIDENCE=PASS
PAYUNI_PRODUCTION_SWITCH=NOT_STARTED_HUMAN_GATE
```

1. Keep PayUNI in Sandbox.
2. Log in to staging with reviewer-safe account.
3. Go to Billing / plan page.
4. Pick the intended test plan.
5. Start PayUNI Sandbox checkout.
6. Use sandbox test card / sandbox payment method only.
7. Complete payment or sandbox simulation.
8. Confirm return URL lands back in InboxPilot.
9. Confirm plan / entitlement / invoice state in UI.
10. Capture screenshots before checkout, PayUNI sandbox page, return page, and resulting billing state.
11. If using ATM / convenience-store simulation, record the sandbox back-office simulation action.

Pass standard:

- PayUNI environment is Sandbox.
- Transaction ID is recorded.
- Return URL works.
- Notify / entitlement state is understandable.
- No production card or production gateway is used.

Fields to fill after completion:

```text
PayUNI sandbox checkout completed: YES/NO
Plan tested:
Payment method:
Sandbox transaction ID:
Return URL result:
Notify result:
Billing screenshot path:
PayUNI sandbox screenshot path:
Remaining blocker:
```

Current evidence paths:

- `reports/ai-team/payuni-sandbox-evidence/04-payuni-sandbox-before-card-entry.png`
- `reports/ai-team/payuni-sandbox-evidence/05-return-or-payment-result.png`
- `reports/ai-team/payuni-sandbox-evidence/06-billing-after-payment.png`
- `reports/ai-team/payuni-sandbox-evidence/07-payuni-merchant-search-result.png`
- `reports/ai-team/payuni-sandbox-evidence/08-payuni-merchant-transaction-detail.png`
- `reports/ai-team/payuni-sandbox-evidence/09-payuni-merchant-payment-status.png`

### 3. Meta App Review Screenshot / Recording Package

1. Open Meta Developers for app `InboxPilot`, App ID `1383365527078199`.
2. Do not press Submit until final package is reviewed.
3. Capture Basic Settings, app icon state, domains, privacy policy, terms, and data deletion URLs.
4. Capture Instagram use case permission state (`md-06-permissions-features.png`, `md-11-advanced-access.png`).
5. Capture webhook callback and subscribed fields.
6. Record staging OAuth flow using reviewer-safe assets.
7. Record dashboard, channels, inbox, contacts, and automation evidence.
8. Redact any IDs, tokens, user names, or data not intended for reviewers.
9. Confirm recording narration explains each requested permission and where the data appears in product.
10. Review final package before submit.

Pass standard:

- Each requested permission has visible product use.
- Privacy / Terms / Data Deletion pages are reachable.
- OAuth / callback / connected channel evidence is complete.
- No secrets, tokens, or real customer data are visible.
- Reviewer credentials and instructions are ready for secure handoff.

Fields to fill after completion:

```text
Meta recording completed: YES/NO
Recording path:
Screenshot folder path:
Redaction review completed: YES/NO
App icon final state:
Permissions covered:
Reviewer credential handoff ready: YES/NO
Remaining blocker:
```

### 4. Business Verification / Advanced Access

1. Confirm Meta Business Manager owner account.
2. Confirm app is associated with the correct business.
3. Review Business Verification status.
4. Review permission Advanced Access / App Review status.
5. Complete any required business docs or Meta prompts.
6. Record final status screenshots.

Pass standard:

- Business Verification status is known.
- Advanced Access / App Review status is known.
- Any pending Meta action is documented.

Fields to fill after completion:

```text
Business Verification status: NOT_STARTED (eligible, start verification button shown)
Advanced Access status: NOT_STARTED (Instagram permissions remain testable only)
Permission review status:
Screenshot path:
Remaining blocker:
```

### 5. Production Deployment Authorization

1. Confirm all human gates above are complete or explicitly waived.
2. Confirm no production DB migration is pending, or migration plan is approved.
3. Confirm production env vars are complete and secret-safe.
4. Confirm final owner approval for `vercel deploy --prod`.
5. Only then run controlled production deployment.

Pass standard:

- Human owner explicitly approves production deploy.
- Production DB plan is clear.
- Production health check passes after deploy.
- Staging alias is not affected.

Fields to fill after completion:

```text
Production deploy approved: YES/NO
Approved by:
Deploy command:
Deployment URL:
Production health result:
Staging health result:
Remaining blocker:
```

### 6. PayUNI Production Switch

1. Keep Sandbox until explicit production switch approval.
2. Confirm merchant production approval.
3. Confirm production keys are present in secure env only.
4. Confirm callback URLs and signing verification.
5. Run low-risk controlled production payment smoke only after approval.
6. Record reconciliation and rollback notes.

Pass standard:

- Production PayUNI switch is explicitly approved.
- Real transaction is controlled and documented.
- No production credentials are exposed.

Fields to fill after completion:

```text
PayUNI production switch approved: YES/NO
Approved by:
Production transaction ID:
Amount:
Return result:
Notify result:
Rollback / refund note:
Remaining blocker:
```

## D. Overall Pass Standards

The human acceptance package can move from `HUMAN_ACCEPTANCE_REQUIRED` to `SALE_READY_CANDIDATE` only when:

- Local validation remains PASS.
- Public staging QA remains PASS.
- Authenticated staging QA remains PASS.
- Reviewer-safe IG / Meta lane evidence is captured.
- PayUNI Sandbox checkout evidence is captured.
- Meta App Review recording package is complete and redacted.
- Human owner explicitly accepts any remaining external risk.
- Production deploy remains off until separately authorized.

## E. Fields To Fill Back Into Reports

Use these fields when updating the final acceptance report:

```text
Meta reviewer-safe IG account connected: YES/NO
Meta connected channel screenshot path:
Meta OAuth recording path:
Meta App Review screenshot folder:
Meta App Review remaining blocker:

PayUNI sandbox checkout completed: YES/NO
PayUNI sandbox transaction ID:
PayUNI sandbox screenshot path:
PayUNI return URL result:
PayUNI notify result:
PayUNI remaining blocker:

Staging dashboard accepted: YES/NO
Staging inbox accepted: YES/NO
Staging contacts accepted: YES/NO
Staging automations accepted: YES/NO
Staging mobile accepted: YES/NO
Remaining staging blocker:

Production deploy approved: YES/NO
PayUNI production switch approved: YES/NO
Meta App Review submitted: YES/NO
Final sale-ready decision: GO/HOLD
Final human owner:
Decision timestamp:
```

## Current Decision

```text
FINAL_HUMAN_ACCEPTANCE_PACKAGE=PASS
NEXT_REQUIRED_ACTION=Hold at human acceptance until Business Verification / Advanced Access and final Meta App Review submit authorization are decided.
```
