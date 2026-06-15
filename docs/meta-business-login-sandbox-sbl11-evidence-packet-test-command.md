# Meta Business Login Sandbox SBL-11 Evidence Packet Test Command

Date: 2026-06-15  
Status: Added  
Scope: Local dry-run evidence packet only

## Purpose

SBL-11 creates and validates a local sandbox evidence packet that can be copied into the runbook, experiment report, and go/no-go checklist after real Meta sandbox evidence is collected.

This is not production implementation. It does not call Meta, exchange real authorization codes, store tokens, register webhooks, sync channels, or create production ConnectedAccount / Channel records.

## Targeted Command

```bash
npx vitest run tests/meta-business-login-sandbox-sbl11-evidence-packet.test.ts
```

## Full Sandbox Regression Command

```bash
npx vitest run tests/meta-business-login-sandbox-production-isolation.test.ts tests/meta-business-login-sandbox-sbl01-route.test.ts tests/meta-business-login-sandbox-sbl01.test.ts tests/meta-business-login-sandbox-sbl03.test.ts tests/meta-business-login-sandbox-sbl04.test.ts tests/meta-business-login-sandbox-sbl05.test.ts tests/meta-business-login-sandbox-sbl06.test.ts tests/meta-business-login-sandbox-sbl07.test.ts tests/meta-business-login-sandbox-sbl08.test.ts tests/meta-business-login-sandbox-sbl09.test.ts tests/meta-business-login-sandbox-sbl11-evidence-packet.test.ts
```

## Assertions

The SBL-11 test verifies:

- The local authorize and callback dry-run payloads can be combined into a redacted evidence packet.
- Run id and workspace id are hash-only values.
- Raw authorization code and raw state do not appear in the packet.
- Production write guard evidence must be present.
- Local dry-run evidence can pass while external Meta evidence remains Hold.
- Internal beta remains No-Go until real external evidence is collected.
- Production implementation remains No-Go even when external evidence flags are marked present, because App Review and manual go/no-go review are still required.

## Gate Meaning

| Gate | Expected status before real Meta evidence | Meaning |
| --- | --- | --- |
| Local dry-run | Pass | Redaction, dry-run mode, and write guards work locally. |
| External Meta evidence | Hold | Real Meta dialog / account selection / callback / reviewer recording evidence is missing. |
| Internal beta | No-Go | Cannot begin without real sandbox execution evidence and manual go/no-go review. |
| Production implementation | No-Go | Requires App Review and production decision gates. |

## Required Backfill After Real Evidence

After a real sandbox run, backfill:

- `docs/meta-business-login-sandbox-runbook-template.md`
- `docs/meta-business-login-sandbox-experiment-report-template.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-business-login-sandbox-implementation-final-report.md`
- `docs/meta-app-review-checklist.md`
- `docs/security-review.md`
- `docs/fix-roadmap.md`
- `docs/codex-session-log.md`

Do not paste raw token, authorization code, secret, raw state, raw nonce, full callback URL, reusable authorize URL, or unmasked Meta asset ids into any file.
