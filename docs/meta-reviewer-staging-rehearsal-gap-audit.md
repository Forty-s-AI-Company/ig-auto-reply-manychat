# Meta Reviewer-Safe Staging Rehearsal Gap Audit

Last updated: 2026-07-03.

## Purpose

This document separates what the current local reviewer rehearsal already proves from what still requires a reviewer-safe Preview / staging tenant or a real reviewer-safe Instagram asset lane.

This is a planning and audit document only. It does not authorize:

- Meta App Review submission
- Meta Dashboard writes
- production deployment
- production database access

## Current Baseline

The repo already has a repeatable local reviewer rehearsal chain:

```powershell
npm run e2e:reviewer:ensure
npm run test:e2e:reviewer
```

That chain runs only on `TEST_DATABASE_URL` and currently proves that InboxPilot can present reviewer-safe labels and walkthrough order for:

- Dashboard
- Channels / Connect / Social connect
- Inbox
- Contacts
- Automations

It does **not** prove:

- real Instagram OAuth success
- real connected Instagram account state
- live webhook-backed message/comment proof
- remote reviewer-safe tenant isolation on Preview / staging

## Local Rehearsal Evidence Already Proven

| Evidence | Local status | Notes |
| --- | --- | --- |
| Dashboard entry and CTA flow | Proven | Reviewer-safe labels and activation CTA copy are covered by smoke. |
| Channels / Connect entry | Proven | The connect surface and empty connected-account state are readable locally. |
| Inbox conversation visibility | Proven | Uses a synthetic reviewer-safe conversation only. |
| Contacts workspace-scoped synthetic data | Proven partially | The contact is present under the rehearsal workspace, but this is still local-only proof. |
| Automations draft visibility | Proven remotely on staging | A staging reviewer tenant now contains a saved draft named `Meta Review Keyword Reply`. |
| Desktop/mobile overflow sanity | Proven | Chromium and mobile Chrome smoke are green. |

## Evidence Still Missing From Local Rehearsal

| Evidence | Why local is not enough | Required lane |
| --- | --- | --- |
| Successful Instagram OAuth return | Local helper does not create a real connected account. | Staging or real reviewer-safe asset lane |
| Connected Instagram channel state after OAuth | Requires a reviewer-safe Instagram Business / Creator asset. | Staging or real reviewer-safe asset lane |
| Live webhook callback / verify token proof | Depends on Meta Dashboard values and live callback wiring. | Real reviewer-safe asset lane |
| Reviewer-safe remote login handoff | Local admin credentials are not the final reviewer credentials. | Manual operator lane |
| Remote tenant with synthetic-only data | Proven | The reviewer-safe staging tenant now shows a connected Instagram channel, a synthetic Inbox conversation, a synthetic Contact, and a saved automation draft. |
| Final screenshot / recording package | Must use redacted remote evidence, not localhost capture. | Staging or production-approved reviewer lane |

## Is Staging Rehearsal Feasible?

Yes, with the current reviewer-safe staging tenant.

Existing repo and launch docs already indicate:

- `docs/product-readiness-review.md` records a real Preview / staging empty-tenant browser QA pass.
- `docs/fix-roadmap.md` records that the empty workspace activation path was exercised on Preview / staging.
- `docs/staging-preview-env-gap-checklist.md` defines a dedicated staging runtime contract and staging-specific env requirements.

The product already supports a reviewer-safe staging rehearsal, but it still depends on a few manual controls:

1. a reviewer-safe staging login handoff,
2. a reviewer-safe Instagram asset/session,
3. final redaction-safe capture discipline.

## Main Gaps Before Staging Rehearsal Can Count As Real Evidence

### 1. Reviewer-safe staging tenant now proves the remote synthetic data lane

The staging reviewer-safe lane is now materially complete for non-live evidence:

- a fresh staging signup was created through the app layer,
- the tenant stayed isolated across Dashboard / Channels / Inbox / Contacts / Automations,
- a reviewer-safe automation draft was saved on staging,
- a reviewer-safe Instagram OAuth connect succeeded on staging,
- a reviewer-safe synthetic conversation is now visible in Inbox,
- a reviewer-safe synthetic contact is now visible in Contacts.

What is still missing:

- a secure credential handoff for reuse outside the current browser session,
- final screenshot/video redaction sign-off.

### 2. Real connected Instagram proof still needs manual asset prep

The local smoke intentionally avoids pretending that a synthetic channel equals a real connected Instagram asset.

Remote rehearsal still needs:

- reviewer-safe Instagram Business / Creator account
- reviewer-safe Meta login with proper access
- successful OAuth completion on the staging tenant

### 3. Live webhook-backed proof is still blocked by reviewer-safe end-to-end scope

Webhook callback / verify token configuration is now complete in Meta Developers. The remaining blocker is not the callback URL itself; it is the lack of a fully reviewer-safe remote asset/data lane:

- real Instagram OAuth still requires the actual reviewer-safe account credentialed session,
- reviewer-safe Inbox / Contacts visibility is now present on staging, but that still does not equal a safe claim that live Meta webhook-backed delivery has been fully proven for review.

### 4. Secure credential handoff remains manual

Reviewer or operator credentials must not appear in git, docs, screenshots, chat, or logs. That remains a manual blocker even if the rest of the staging rehearsal path is ready.

## Recommended Lane C: Reviewer-Safe Staging Rehearsal

Run this only after the local reviewer rehearsal is green.

Canonical manual flow:

- `docs/meta-reviewer-staging-tenant-sop.md`

1. Confirm staging runtime health first:
   - open `/api/health/staging`
   - verify staging signals are healthy
2. Use the existing reviewer-safe staging tenant or create a fresh one if it has drifted:
   - no real customer data
   - no access to other workspaces
   - dedicated reviewer-safe workspace label
3. Provision a reviewer-safe staging login through secure operator handoff.
4. Prepare only synthetic reviewer-safe objects in that tenant:
   - one contact
   - one conversation
   - one automation draft (already proven possible on staging)
5. If OAuth success must be recorded, connect the reviewer-safe Instagram asset through the real staging flow.
6. Rehearse:
   - Dashboard
   - Channels / Connect
   - Inbox
   - Contacts
   - Automations
7. Record only after confirming:
   - no real customer data appears
   - no secret values appear
   - no localhost / preview-debugging artifacts appear

## Go / Hold

### Go when:

- local reviewer rehearsal is green,
- staging health is green,
- a dedicated reviewer-safe staging tenant exists and already shows reviewer-safe Inbox / Contacts / Automations evidence,
- reviewer-safe credentials are available through secure handoff,
- reviewer-safe Instagram asset is ready if OAuth success must be shown,
- the redaction checklist is ready.

### Hold when:

- the staging tenant is shared with unsafe data,
- reviewer-safe login is missing,
- reviewer-safe Instagram asset is missing,
- webhook/dashboard setup still makes the evidence ambiguous,
- operator cannot guarantee redacted capture.

## Practical Conclusion

The local reviewer-safe rehearsal now proves the product walkthrough structure and synthetic demo labeling well enough for script practice and internal QA.

The remote reviewer-safe staging lane is now good enough for connected-channel, Inbox, Contacts, and automation-draft recording. The remaining work is mostly operator preparation and any final live webhook/comment proof that should still stay out of scope until it can be demonstrated safely.
