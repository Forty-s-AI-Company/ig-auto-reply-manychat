# Meta Business Login Internal Beta Doc Index

Date: 2026-06-16
Status: Internal beta document index / internal beta Hold / App Review submission preparation Hold / production implementation No-Go

## Scope

This document indexes the Meta Business Login / Instagram Business Login internal beta documentation set and summarizes the current stage status.

This document does not change:

- OAuth flow
- callback route
- login button
- environment variables
- Prisma schema
- Supabase migration state
- production ConnectedAccount / Channel writes
- real Meta token exchange

Supabase note:

```text
Do not run Supabase migration or db push for this documentation index.
Before any future Supabase migration or db push, record current project_id, linked project, and Supabase account email, then wait for explicit confirmation.
```

## 1. Internal Beta Documents And Purpose

| Document | Purpose | Current status |
| --- | --- | --- |
| `docs/meta-business-login-internal-beta-final-preflight-checklist.md` | Defines the final preflight gates before internal beta can move from Hold to Go. | Draft checklist / gates not executed |
| `docs/meta-business-login-internal-beta-evidence-collection-runbook.md` | Defines how to collect safe evidence for package assembly, redaction, recording, screenshots, permission proof, test assets, access controls, rollback, and guards. | Draft runbook / not executed |
| `docs/meta-business-login-internal-beta-evidence-execution-report-template.md` | Provides the report template for recording actual evidence execution results. | Blank template / not executed |
| `docs/meta-business-login-internal-beta-release-decision-memo-template.md` | Provides the decision memo for internal beta Go or Hold after evidence execution. | Blank template / not signed |
| `docs/meta-business-login-internal-beta-launch-checklist.md` | Provides the launch checklist used only after the release decision memo records internal beta Go. | Blank checklist / launch not approved |
| `docs/meta-business-login-internal-beta-monitoring-report-template.md` | Provides the monitoring report template for access, redaction, guards, UX, consent, callback, fallback, issue, and pause-trigger monitoring during beta. | Blank template / monitoring not started |
| `docs/meta-business-login-internal-beta-closeout-report-template.md` | Provides the beta closeout template for summarizing monitoring results, issues, remediation, final beta conclusion, and App Review submission preparation readiness. | Blank template / closeout not started |

Supporting decision / evidence documents:

| Document | Purpose | Current status |
| --- | --- | --- |
| `docs/meta-business-login-final-app-review-package-assembly-checklist.md` | Defines the App Review package assembly gate and per-file packaging rules. | Draft checklist / actual package not assembled |
| `docs/meta-business-login-final-redaction-search-execution-report-template.md` | Defines final redaction search execution reporting. | Blank template / not executed |
| `docs/meta-business-login-final-reviewer-recording-shot-list.md` | Defines the reviewer recording shots and visual redaction requirements. | Draft recording plan / recording not captured |
| `docs/meta-business-login-final-permission-usage-proof-matrix.md` | Maps permissions to product screens, data usage, evidence status, and recommendations. | Draft matrix / proof not complete |
| `docs/meta-business-login-sandbox-go-no-go-checklist.md` | Tracks stage-level gate decisions across sandbox and internal beta. | Updated index / gates still Hold |
| `docs/meta-app-review-checklist.md` | Tracks App Review readiness implications. | Updated index / App Review readiness Hold |
| `docs/security-review.md` | Tracks security notes for each sandbox / internal beta documentation step. | Updated index / production remains No-Go |

## 2. Recommended Reading Order

Read in this order when deciding whether internal beta can move forward:

1. `docs/meta-business-login-final-permission-usage-proof-matrix.md`
2. `docs/meta-business-login-final-reviewer-recording-shot-list.md`
3. `docs/meta-business-login-final-redaction-search-execution-report-template.md`
4. `docs/meta-business-login-final-app-review-package-assembly-checklist.md`
5. `docs/meta-business-login-internal-beta-final-preflight-checklist.md`
6. `docs/meta-business-login-internal-beta-evidence-collection-runbook.md`
7. `docs/meta-business-login-internal-beta-evidence-execution-report-template.md`
8. `docs/meta-business-login-internal-beta-release-decision-memo-template.md`
9. `docs/meta-business-login-internal-beta-launch-checklist.md`
10. `docs/meta-business-login-internal-beta-monitoring-report-template.md`
11. `docs/meta-business-login-internal-beta-closeout-report-template.md`
12. `docs/meta-business-login-sandbox-go-no-go-checklist.md`
13. `docs/meta-app-review-checklist.md`
14. `docs/security-review.md`

## 3. Decision Path

Current decision path from evidence to closeout:

```text
Evidence prerequisites
  -> final App Review package assembly checklist
  -> internal beta final preflight checklist
  -> evidence collection runbook
  -> evidence execution report
  -> release decision memo
  -> internal beta launch checklist
  -> monitoring report
  -> closeout report
  -> App Review submission preparation decision
  -> production implementation remains No-Go until separate approval
```

Mermaid-style flow:

```text
Research / sandbox evidence
  |
  v
Permission proof + reviewer recording + redaction + package assembly
  |
  v
Internal beta preflight
  |
  v
Evidence collection
  |
  v
Evidence execution report
  |
  v
Release decision memo
  |
  +--> Hold -> fix evidence / access / rollback / redaction issues -> rerun evidence
  |
  +--> Go
        |
        v
      Launch checklist
        |
        v
      Monitoring report(s)
        |
        +--> Pause -> remediate -> rerun launch / monitoring gates
        |
        +--> Continue
        |
        v
      Closeout report
        |
        +--> App Review submission preparation Hold
        |
        +--> App Review submission preparation Go
              |
              v
            App Review submission package preparation only
              |
              v
            Production implementation remains No-Go
```

## 4. Template / Draft Status

Documents that are still templates:

- `docs/meta-business-login-internal-beta-evidence-execution-report-template.md`
- `docs/meta-business-login-internal-beta-release-decision-memo-template.md`
- `docs/meta-business-login-internal-beta-monitoring-report-template.md`
- `docs/meta-business-login-internal-beta-closeout-report-template.md`
- `docs/meta-business-login-final-redaction-search-execution-report-template.md`

Documents that are draft checklists / runbooks:

- `docs/meta-business-login-internal-beta-final-preflight-checklist.md`
- `docs/meta-business-login-internal-beta-evidence-collection-runbook.md`
- `docs/meta-business-login-internal-beta-launch-checklist.md`
- `docs/meta-business-login-final-app-review-package-assembly-checklist.md`
- `docs/meta-business-login-final-reviewer-recording-shot-list.md`
- `docs/meta-business-login-final-permission-usage-proof-matrix.md`

Documents that are status indexes:

- `docs/meta-business-login-internal-beta-doc-index.md`
- `docs/meta-business-login-sandbox-go-no-go-checklist.md`
- `docs/meta-app-review-checklist.md`
- `docs/security-review.md`

## 5. Gates Not Yet Passed

Current gates still not passed:

| Gate | Required before | Current status |
| --- | --- | --- |
| Final App Review package assembly | Internal beta Go | Hold |
| Final redaction report execution | Internal beta Go | Hold |
| Reviewer recording captured and reviewed | Internal beta Go / App Review prep | Hold |
| Screenshot package reviewed | Internal beta Go / App Review prep | Hold |
| Permission proof complete | Internal beta Go / App Review prep | Hold |
| Test asset proof complete | Internal beta Go / App Review prep | Hold |
| Meta Dashboard scope reconciliation | Internal beta Go / App Review prep | Hold |
| Internal-only entry point verification | Internal beta Go | Hold |
| Workspace allowlist verification | Internal beta Go | Hold |
| User / admin role verification | Internal beta Go | Hold |
| Rollback / fallback verification | Internal beta Go | Hold |
| Production write guard final verification | Internal beta Go | Hold despite prior evidence |
| Token exchange guard final verification | Internal beta Go | Hold despite prior evidence |
| Product owner sign-off | Internal beta Go | Hold |
| Launch checklist execution | Internal beta launch | Hold |
| Monitoring report execution | Continue / pause / end beta | Hold |
| Closeout report execution | App Review preparation decision | Hold |
| App Review submission preparation decision | App Review package submission prep | Hold |
| App Review approval | Production implementation | Missing |
| Business Verification / Advanced Access confirmation | Production implementation | Missing |

## 6. Why Internal Beta Is Still Hold

Internal beta remains Hold because:

- The release decision memo has not recorded `Internal beta: Go`.
- The final App Review / internal beta package has not been assembled and signed.
- Final redaction report execution has not been completed against real package artifacts.
- Final reviewer recording and screenshots have not been captured and reviewed.
- Permission proof and test asset proof are not complete for every kept scope.
- Meta Dashboard scopes have not been reconciled against the final proof matrix.
- Internal-only entry point, workspace allowlist, and user role checks are not executed.
- Rollback / fallback checks are not executed.
- Production write guard and token exchange guard need final pre-launch verification.
- Product owner / engineering / security / App Review / operations sign-off is not complete.

Current decision:

```text
Internal beta: Hold
```

## 7. App Review Submission Preparation Status

App Review submission preparation is still Hold.

Reasons:

- Internal beta has not launched or closed out successfully.
- Reviewer package is not assembled.
- Final redaction report is not executed.
- Permission proof and test asset proof remain incomplete.
- Scope reconciliation remains Hold.
- Closeout report has not concluded beta as Successful or approved Ended.

Current decision:

```text
App Review submission preparation: Hold
```

## 8. Why Production Implementation Still Cannot Start

Production implementation remains No-Go.

Reasons:

- App Review is not submitted or approved.
- Business Verification / Advanced Access status is not confirmed for the final scope set.
- Internal beta is still Hold.
- App Review submission preparation is still Hold.
- Production env migration plan is not approved.
- No Supabase migration / db push has been reviewed or confirmed for this provider.
- Production callback behavior for real token exchange is not implemented or reviewed.
- Production ConnectedAccount / Channel writes remain intentionally blocked in sandbox.
- Real token storage, encryption, refresh, revocation, and expiry lifecycle are not approved for this provider.
- Webhook registration and channel sync lifecycle are not approved for real assets.
- Tenant isolation regression for real Business / Page / IG asset writes is not complete.
- Production rollback / monitoring plan is not complete.
- Existing Instagram OAuth fallback must remain available until a separate production implementation ADR is approved.

Current decision:

```text
Production implementation: No-Go
```

## 9. Recommended Next Documents Or Evidence Tasks

Recommended next steps:

1. Execute the final App Review package assembly checklist against actual artifacts.
2. Execute the final redaction search report against docs, screenshots, recordings, logs, audit exports, and test output.
3. Capture final reviewer recording and screenshots using the reviewer recording shot list.
4. Complete permission proof and test asset proof for every kept scope.
5. Reconcile current Meta Dashboard scopes against the final permission proof matrix.
6. Execute internal beta evidence collection runbook and fill the evidence execution report.
7. Complete release decision memo with actual Go / Hold decision and sign-off.
8. If Go, execute the launch checklist and produce monitoring reports.
9. After monitoring, complete the closeout report and decide whether App Review submission preparation can begin.

Suggested next prompt:

```text
請根據 docs/meta-business-login-internal-beta-doc-index.md 與 docs/meta-business-login-final-app-review-package-assembly-checklist.md，建立第一份 Meta Business Login internal beta evidence execution plan for real artifacts。

請只新增 / 更新文件，不要改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env，不要改 Prisma schema，不要執行 Supabase migration。

檔案路徑：
docs/meta-business-login-internal-beta-real-evidence-execution-plan.md

內容需包含：
1. 要收集的實際 artifact 清單
2. 每個 artifact 的 owner / version / redaction gate
3. reviewer recording / screenshots / permission proof / test asset proof 的實際收集順序
4. redaction report 實際執行順序
5. internal-only access / allowlist / role / rollback / guard 的實測順序
6. 完成後要填哪些 template
7. internal beta Go / Hold 判定方式
8. production implementation 仍不可開始的原因

完成後執行 git status、targeted tests、npm run lint、npm run build，commit 並 push master。
```

## 10. Explicit Restrictions

Do not perform these actions in this documentation phase:

- Do not run Supabase migration.
- Do not run Supabase `db push`.
- Do not modify the production OAuth flow.
- Do not modify the callback route.
- Do not modify the login button.
- Do not modify environment variables.
- Do not modify Prisma schema.
- Do not create or update production ConnectedAccount / Channel records.
- Do not perform real Meta token exchange.
- Do not write raw token, authorization code, raw state, raw nonce, full callback URL, app secret, client secret, webhook verify token, cookie, localStorage, sessionStorage, unmasked asset ID, or real customer data into docs, logs, audit, test output, screenshots, or recordings.

## Final Index Decision

```text
Internal beta document index: Ready
Internal beta: Hold
App Review submission preparation: Hold
Production implementation: No-Go

Next step:
Execute real artifact evidence collection and fill the existing templates before requesting internal beta Go.
```
