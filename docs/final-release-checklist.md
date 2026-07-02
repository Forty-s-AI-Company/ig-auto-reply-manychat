# InboxPilot final release checklist

Date: 2026-07-02

## Engineering

- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] `npm test` passes.
- [ ] Focused Playwright smoke for auth, inbox, contacts, simple release, and analytics passes.
- [ ] No `.env`, secret, runtime report, cache, or test output is staged.
- [ ] PR diff is single-theme and reviewable.

## Product

- [ ] Dashboard gives a clear next step for new users.
- [ ] Inbox search/filter/conversation selection/reply feedback works or gives a clear disabled reason.
- [ ] Contacts tag creation, filters, batch actions, and detail editing are verified.
- [ ] Channels / Social connect shows user-readable Meta errors and no raw provider error.
- [ ] Automations and Sequences avoid fake buttons and use clear destructive-action dialogs.
- [ ] Analytics chart and empty states explain what data is being shown.
- [ ] Billing and referral copy clearly states Sandbox / non-cash credit limits where applicable.

## Security / Data

- [ ] Workspace / tenant scope is enforced for authenticated data routes.
- [ ] Admin routes require admin/operator authorization.
- [ ] Meta tokens are never rendered in client UI, URLs, or logs.
- [ ] PayUNI notify / return / refund-related routes have signature/idempotency review.
- [ ] Webhooks have signature/idempotency/retry behavior documented.
- [ ] Rate limit / origin / CSRF posture is documented for sensitive routes.

## Operations

- [ ] Production env values are present and redacted in any report.
- [ ] Staging env values are separated from Production.
- [ ] Production DB backup / PITR policy is confirmed before any future schema migration.
- [ ] Staging health is healthy.
- [ ] Production health is healthy.
- [ ] Rollback path is documented.
- [ ] Vercel Preview deploy batching rule is followed to avoid quota burn.

## Launch holds

- [ ] Meta App Review is not yet submitted.
- [ ] PayUNI production credentials are not yet enabled.
- [ ] Production deploy is not part of this QA branch.
- [ ] Production DB mutation is not part of this QA branch.

