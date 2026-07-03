# Meta Reviewer Demo Data Preparation Runbook

Last updated: 2026-07-03.

## Purpose

This runbook explains how to prepare reviewer-safe demo assets for Meta App Review without guessing values, leaking secrets, or writing directly to production databases.

It focuses on four evidence groups that still need preparation outside the current document set:

1. Reviewer-safe workspace
2. Reviewer-safe connected Instagram channel state
3. Synthetic Inbox / Contacts demo data
4. Simple Automations keyword/comment draft

This runbook does not submit App Review, does not change Meta Dashboard settings, and does not approve production writes.

## Boundaries

Allowed in this preparation phase:

- Local `TEST_DATABASE_URL` rehearsal
- Local Playwright / smoke verification
- Synthetic test data only
- Secure external handoff planning
- Source-level documentation updates

Not allowed in this preparation phase:

- Writing directly to production DB through ad-hoc scripts
- Pasting reviewer credentials into docs/chat/git
- Recording real customer data
- Claiming webhook-backed live proof before Meta webhook setup is complete

## Reusable Demo Assets Already In Repo

### 1. Default local admin bootstrap

Reusable command:

```powershell
npm run admin:ensure
```

What it gives:

- Local admin user from `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- `default-workspace`
- Admin membership in that workspace

What it does not give:

- Instagram channel proof
- Inbox conversation proof
- Contacts proof
- Reviewer-safe automation proof

### 2. Local demo seed

Reusable command:

```powershell
npm run prisma:seed
```

Source:

- `prisma/seed.ts`

What it gives:

- `default-workspace`
- Mock / Telegram placeholder channels
- Demo tags
- Demo knowledge-base item
- Demo keyword automation `demo-keyword-automation`

What it is good for:

- Local rehearsal of safe automation copy and demo content structure

What it is not good for:

- Reviewer-ready Instagram connected-channel evidence
- Reviewer-ready Inbox / Contacts screenshots on production

### 3. Rich authenticated E2E fixture set

Reusable command:

```powershell
npm run e2e:admin:ensure
```

Source:

- `scripts/ensure-e2e-admin.ts`

What it gives inside `TEST_DATABASE_URL`:

- Admin user
- `default-workspace`
- Two Instagram-like channels:
  - `Instagram E2E`
  - `Instagram E2E Alt`
- Safe tags
- Synthetic contacts
- Synthetic conversations/messages

What it is good for:

- Rehearsing Inbox scope
- Rehearsing Contacts scope
- Rehearsing multi-channel UI behavior
- Rehearsing “reviewer should see a conversation/contact exists” style evidence locally

What it is not good for:

- Real reviewer-facing naming
- Connected Instagram OAuth success proof
- Production reviewer handoff as-is, because labels are still E2E-oriented

### 3.5 Reviewer-safe local rehearsal helper

Reusable command:

```powershell
npm run e2e:reviewer:ensure
```

Source:

- `scripts/ensure-reviewer-demo-data.ts`

What it gives inside `TEST_DATABASE_URL`:

- Reviewer-safe local admin user
- `InboxPilot Review Workspace`
- `Instagram Review Channel`
- `Meta Reviewer Test Contact`
- One synthetic reviewer-safe Inbox conversation
- One disabled reviewer-safe keyword automation draft

What it is good for:

- Local rehearsal with labels that look like final reviewer evidence instead of raw `E2E` fixtures
- Practicing screenshots, walkthrough order, and operator narration
- Verifying that Inbox / Contacts / Automations proof can be explained without leaking internal test naming

What it is not good for:

- Real Meta OAuth success proof
- Real connected Instagram asset proof
- Production reviewer handoff as-is

### 4. Empty workspace activation fixture

Reusable command:

```powershell
npm run e2e:empty:ensure
```

Sources:

- `scripts/ensure-empty-e2e-admin.ts`
- `tests/e2e/empty-workspace-activation.spec.ts`

What it gives:

- A truly empty test workspace
- Login path for “first-run, no channels, no contacts, no automations”

What it is good for:

- Rehearsing onboarding / empty-state flow
- Confirming no fake CTA or broken onboarding path

What it is not good for:

- Connected channel evidence
- Inbox / Contacts / Automations populated evidence

### 5. Source-level smoke that already covers the reviewer path

Reusable tests:

```powershell
npx playwright test tests/e2e/public-and-auth.spec.ts --project=chromium --workers=1
npx playwright test tests/e2e/inbox-auth.spec.ts --project=chromium --workers=1
npx playwright test tests/e2e/empty-workspace-activation.spec.ts --project=chromium --workers=1
```

What they prove:

- Dashboard / Channels / Inbox / Contacts / Automations routes are real
- Empty-workspace onboarding exists
- Rich workspace Inbox flow exists
- Some reviewer-facing CTA/disabled UX is already stable

What they do not prove:

- A real Meta OAuth approval on the production domain
- A real connected reviewer-safe Instagram asset
- A production reviewer-safe workspace with only safe data

## Recommended Reviewer Evidence Prep Strategy

### Lane A: Local rehearsal lane

Use this lane to rehearse the evidence chain safely on `TEST_DATABASE_URL`.

1. Prepare empty onboarding state:

```powershell
npm run e2e:empty:ensure
npx playwright test tests/e2e/empty-workspace-activation.spec.ts --project=chromium --workers=1
```

2. Prepare populated Inbox / Contacts rehearsal state:

```powershell
npm run e2e:admin:ensure
npx playwright test tests/e2e/public-and-auth.spec.ts --project=chromium --workers=1
npx playwright test tests/e2e/inbox-auth.spec.ts --project=chromium --workers=1
```

3. Prepare reviewer-safe labeled rehearsal state:

```powershell
npm run e2e:reviewer:ensure
npm run test:e2e:reviewer
```

4. Optional local automation draft rehearsal:

```powershell
npm run prisma:seed
```

Use the seeded keyword automation only as a copy/reference source, not as proof that production reviewer assets are already ready.

### Lane B: Real reviewer asset lane

Use this lane later, outside this turn, for the actual Meta package:

1. Create or reserve a reviewer-safe InboxPilot user.
2. Create or reserve a reviewer-safe workspace with no customer data.
3. Connect a reviewer-safe Instagram Business / Creator asset through the real product flow.
4. Prepare one synthetic conversation and one synthetic contact under that same workspace/channel.
5. Prepare one simple keyword/comment automation draft under that same workspace.
6. Verify public Privacy / Terms / Data Deletion pages still match the production domain.

Important:

- Lane B cannot be completed from existing local E2E fixtures alone.
- Lane B still needs manual operator-controlled assets.
- Lane B must remain Hold for live message/comment proof until Meta webhook callback / verify token are configured.

### Lane C: Reviewer-safe staging rehearsal

Before using Preview / staging as reviewer evidence, read:

- `docs/meta-reviewer-staging-rehearsal-gap-audit.md`
- `docs/meta-reviewer-staging-tenant-sop.md`

This lane sits between local rehearsal and the final reviewer package:

1. Reuse the local reviewer rehearsal as the baseline.
2. Move to a dedicated reviewer-safe staging tenant only.
3. Confirm the staging tenant contains synthetic data only.
4. Use a real reviewer-safe Instagram asset if OAuth success or connected-channel state must be shown.
5. The current staging reviewer lane already proves connected-channel, Inbox, Contacts, and automation-draft visibility; keep local rehearsal for dry-runs and fallback verification.

## Mapping Current Repo Assets To Reviewer Evidence

| Reviewer evidence target | Best reusable repo asset today | Can use directly? | Notes |
| --- | --- | --- | --- |
| Empty workspace onboarding | `scripts/ensure-empty-e2e-admin.ts` + `tests/e2e/empty-workspace-activation.spec.ts` | Yes, for local rehearsal | Good for CTA and empty-state proof only. |
| Inbox conversation proof | `scripts/ensure-reviewer-demo-data.ts` + `tests/e2e/inbox-auth.spec.ts` | Partial | Local rehearsal is strong, and the current staging reviewer lane also shows a visible reviewer-safe conversation. |
| Contacts scope proof | `scripts/ensure-reviewer-demo-data.ts` | Partial | Local rehearsal is strong, and the current staging reviewer lane also shows a visible reviewer-safe contact. |
| Automation setup proof | `scripts/ensure-reviewer-demo-data.ts` and `prisma/seed.ts` | Partial | Reviewer-safe draft exists locally and a staging draft named `Meta Review Keyword Reply` is already visible. |
| Connected Instagram channel proof | Product code + staging reviewer lane | Yes, on staging | Now proven through a real reviewer-safe staging OAuth connect; keep local fixtures only for rehearsal. |
| Privacy / Terms / Data Deletion proof | Public product pages | Yes | Can be recorded directly once final redaction is ready. |

## Gaps That Still Need New SOP / Helper / Manual Work

### Needs a new SOP now

This runbook itself is the missing SOP layer between raw E2E fixtures and the final reviewer package.

### Needs a new helper later if we want less manual work

Implemented in this round:

1. A `reviewer-safe local demo seed` helper for `TEST_DATABASE_URL` only
   - Command: `npm run e2e:reviewer:ensure`
   - Purpose: create reviewer-labeled workspace/contact/conversation/automation data instead of E2E-labeled data
   - Scope: local/test DB only

2. A `reviewer-safe rehearsal smoke`
   - Command: `npm run test:e2e:reviewer`
   - Purpose: verify Dashboard -> Channels -> Inbox -> Contacts -> Automations can be rehearsed with reviewer-safe labels
   - Scope: local/test DB only

Still recommended later:

3. A `reviewer asset verification smoke`
   - Purpose: assert a reviewer-safe workspace contains only synthetic data and expected pages
   - Scope: local/staging controlled tenant only
   - Not safe to fake on production without operator-provided reviewer assets

### Local rehearsal vs staging rehearsal

Local rehearsal currently proves:

- reviewer-safe labels
- route order
- empty/populated rehearsal narrative
- desktop/mobile smoke stability

Staging rehearsal is still needed for:

- reviewer-safe remote login
- reviewer-safe remote tenant isolation
- successful OAuth completion on a real reviewer-safe Instagram asset
- final redacted screenshot / recording capture

Use `docs/meta-reviewer-staging-rehearsal-gap-audit.md` to decide whether the remote lane is ready or still blocked by manual setup.
Use `docs/meta-reviewer-staging-tenant-sop.md` to execute the manual staging login / tenant / cleanup steps consistently.

### Still manual by design

These should stay manual:

- Reviewer-safe Instagram asset selection
- Secure credential handoff
- Final Meta Dashboard webhook / permission setup
- Final recording and screenshot redaction review

## Suggested Safe Labels

Use labels like these when the final reviewer-safe assets are created:

```text
Workspace: InboxPilot Review Workspace
Channel label: Instagram Review Channel
Contact: Meta Reviewer Test Contact
Message: Hi, I want product information.
Keyword: price
Automation: Meta Review Keyword Reply
```

Avoid labels that look internal or test-framework specific, such as:

- `E2E`
- `Smoke`
- `Fixture`
- `default-workspace`
- raw workspace IDs

## Go / Hold For Evidence Prep

Go when:

- Local rehearsal passes for both empty and populated flows
- Reviewer-safe asset checklist is filled with safe labels
- It is clear which parts are still manual
- No document claims live webhook proof prematurely

Hold when:

- Reviewer proof still depends on raw E2E naming with no relabel plan
- The only connected-channel proof depends on internal-only or unsafe data
- Anyone plans to use local test screenshots as if they were final production reviewer artifacts
- Webhook callback / verify token are still unset but the package wording implies live event proof
