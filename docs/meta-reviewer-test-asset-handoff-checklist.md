# Meta Reviewer-Safe Test Asset Handoff Checklist

Last updated: 2026-06-26.

## Purpose

This checklist prepares the reviewer-safe accounts, workspace, Instagram assets, and handoff notes needed for Meta App Review.

Do not log in to Meta Developer Dashboard from this flow. Do not submit App Review. Do not write passwords, tokens, app secrets, access tokens, raw OAuth callback URLs, recovery codes, or real customer data into this document.

Related documents:

- `docs/meta-app-review-submission-package.md`
- `docs/meta-reviewer-recording-shot-list.md`
- `docs/meta-app-review-screenshot-redaction-checklist.md`

## Handoff Principles

- Use reviewer-safe test assets only.
- Keep credentials out of git, docs, chat, screenshots, recordings, logs, and issue comments.
- Share any password or one-time access method through a secure external handoff channel controlled by the operator.
- Prefer temporary reviewer credentials with limited permissions.
- Do not reuse operator/admin credentials.
- Remove or rotate reviewer access after App Review is complete.

## Asset Inventory

Fill this table with safe labels only. Do not paste secrets.

| Asset | Safe label to record | Required? | Owner | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| InboxPilot reviewer user | Reviewer user label, not password. | Yes | Operator | Prepare | Use a non-personal email if possible. |
| InboxPilot reviewer password | Do not record here. | Yes | Operator | Secure handoff | Send through secure password handoff only. |
| Test workspace | Workspace display name only. | Yes | Operator | Prepare | Must not contain customer data. |
| Test Instagram account | Safe IG handle or masked label. | Yes | Operator | Prepare | Use Business/Creator test asset. |
| Facebook Page | Safe Page name or masked label. | If required | Operator | Prepare | Only if selected Meta flow requires Page linkage. |
| Business asset | Masked Business label. | If required | Operator | Prepare | Do not record Business ID unless Meta requires it in a secure dashboard field. |
| Test conversation | Safe scenario label. | Recommended | Operator | Prepare | Must contain synthetic text only. |
| Test contact | Safe contact display name. | Recommended | Operator | Prepare | Avoid personal names/emails/phones. |
| Test automation | Automation display name. | Yes | Operator | Prepare | Keyword/comment trigger with safe response. |
| Reviewer instruction note | File/link label. | Yes | Operator | Prepare | Must not include passwords/secrets. |

## Reviewer Account Requirements

InboxPilot reviewer user:

- `[ ]` Can sign in to production or approved review environment.
- `[ ]` Has access only to reviewer-safe workspace.
- `[ ]` Has minimum role needed to connect Instagram and view demo screens.
- `[ ]` Has no access to real customer workspaces.
- `[ ]` Has no admin, payout, DB, billing ops, or internal tooling permissions unless absolutely required and approved.
- `[ ]` Uses a temporary password or secure access method.
- `[ ]` Password is never committed, pasted into chat, or included in screenshots/recordings.

Hold if:

- Reviewer user can see real customers.
- Reviewer user can access admin-only or payout surfaces.
- Reviewer user requires operator MFA during review and no safe handoff exists.

## Instagram / Meta Test Asset Requirements

Test Instagram asset:

- `[ ]` Belongs to the operator/test business, not a real customer.
- `[ ]` Is suitable for Meta reviewer use.
- `[ ]` Can authorize the requested Instagram flow.
- `[ ]` Has safe display name, username, profile image, and sample content.
- `[ ]` Has no private customer DMs, comments, media, or personal data.
- `[ ]` Can generate or display one safe test conversation/comment scenario.

Facebook Page / Business asset, if required:

- `[ ]` Uses test-safe Page name and content.
- `[ ]` Does not expose customer data.
- `[ ]` Has the role/access needed for reviewer flow.
- `[ ]` Is linked to the test Instagram asset as required by the selected Meta flow.

Hold if:

- The asset contains real customer data.
- The asset cannot complete the selected OAuth/authorization flow.
- Reviewer needs access to a personal operator account.

## Demo Data Requirements

Prepare only synthetic examples:

- Test message: "Hi, I want product information."
- Test keyword: "price"
- Test automation response: "Thanks for your message. We will send details shortly."
- Test contact name: "Meta Reviewer Test Contact"
- Test workspace name: "InboxPilot Review Workspace"

Do not use:

- Real customer names.
- Real customer messages.
- Real payment/order details.
- Real phone numbers or addresses.
- Real private Instagram conversations.

## Secure Handoff Method

Allowed handoff methods:

- Password manager secure share.
- Temporary one-time secret link.
- Organization-approved encrypted note.
- Live operator-assisted login during review recording, if no credential is shown.

Not allowed:

- Git commit.
- Markdown docs.
- Chat messages.
- GitHub issue/PR comments.
- Screenshots.
- Screen recordings.
- Email thread containing raw password or recovery code.

Handoff record should include only:

```text
Handoff method:
Recipient:
Expiration:
Asset labels included:
Operator owner:
Revocation plan:
```

Do not include the actual secret.

## Reviewer Instruction Note Template

Use this as a safe instruction note. Replace bracketed labels with safe labels only.

```text
InboxPilot Meta Review Instructions

App URL:
https://inboxpilot.carry-digital-nomad.in.net

Reviewer account:
[REVIEWER_USER_LABEL]

Password handoff:
Provided through [SECURE_HANDOFF_METHOD]. Do not request password in public comments.

Steps:
1. Sign in to InboxPilot.
2. Open Channels.
3. Click Connect Instagram.
4. Authorize the reviewer-safe Instagram test asset.
5. Return to InboxPilot and confirm the Instagram channel is connected.
6. Open Inbox and view the safe test conversation.
7. Open Contacts and confirm the safe test contact.
8. Open Automations and review the simple keyword/comment automation.
9. Review Privacy Policy, Data Deletion, and Terms pages.

Notes:
- This reviewer account contains synthetic test data only.
- InboxPilot stores tokens server-side and uses tenant-scoped channel credentials in production.
- Production global Meta fallback tokens are disabled.
```

## Pre-Handoff Smoke

Run before sending reviewer instructions:

- `[ ]` Production `/api/health` returns ok.
- `[ ]` Reviewer user can sign in.
- `[ ]` Reviewer user lands in the intended test workspace.
- `[ ]` Reviewer user cannot access real workspaces.
- `[ ]` Channels page loads.
- `[ ]` Instagram connect flow can start.
- `[ ]` Connected channel appears after authorization, or reconnect instructions are clear.
- `[ ]` Inbox shows only reviewer-safe data.
- `[ ]` Contacts show only reviewer-safe data.
- `[ ]` Automation screen shows reviewer-safe automation.
- `[ ]` Privacy Policy, Data Deletion, and Terms pages load publicly.

## Post-Review Cleanup

After App Review is complete:

- `[ ]` Remove or disable reviewer user.
- `[ ]` Rotate any temporary reviewer password.
- `[ ]` Remove reviewer app roles if no longer needed.
- `[ ]` Revoke temporary asset access if granted.
- `[ ]` Archive final approved reviewer instructions.
- `[ ]` Delete unneeded local screenshots/recordings containing account labels.
- `[ ]` Record completion in launch log.

## Go / Hold

Go when:

- Reviewer-safe user, workspace, Instagram asset, and demo data are ready.
- Secure handoff method is selected.
- Reviewer instructions contain no secrets.
- Pre-handoff smoke passes.
- Product/security reviewer signs off.

Hold when:

- Any credential would need to be pasted into docs/chat/GitHub.
- Reviewer assets expose real customer data.
- Reviewer user can access production admin/customer data outside the test workspace.
- OAuth flow cannot be reproduced.
- No revocation/cleanup plan exists.

This document intentionally stops before Meta Dashboard upload or App Review submission.
