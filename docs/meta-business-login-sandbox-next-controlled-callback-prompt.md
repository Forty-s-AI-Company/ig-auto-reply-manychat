# Meta Business Login Sandbox Next Controlled Callback Prompt

Date: 2026-06-16  
Status: Ready to copy  
Scope: Next safe Codex prompt before completing Instagram Business Login OAuth callback

## Why This Prompt Exists

The previous run confirmed that Instagram Business Login with `force_reauth=true` can show account selection and that `carry.digital.nomad` can be selected.

However, the configured redirect URI currently points to the production Instagram callback route. Re-opening the same OAuth URL may now skip profile selection and proceed directly to OAuth consent or callback.

The next task must therefore prepare a controlled callback capture path before any final OAuth authorization is attempted.

## Copyable Prompt

```text
請繼續 Meta Business Login sandbox controlled callback 階段。

限制：
1. 不要修改正式 OAuth flow。
2. 不要修改正式 /api/instagram/oauth/callback 的既有行為。
3. 不要修改登入按鈕。
4. 不要修改 env。
5. 不要修改 Prisma schema。
6. 不要建立或更新 production ConnectedAccount / Channel。
7. 不要註冊 production webhook。
8. 不要啟動 production channel sync。
9. 不要做真實 Meta token exchange，除非已經有 sandbox-only capture guard。
10. 不要在文件、log、URL、audit、console 中記錄 raw token、authorization code、secret、raw state、raw nonce、完整 callback URL、cookie、localStorage、sessionStorage。

請先閱讀：
- AGENTS.md
- README.md
- docs/meta-business-login-sandbox-authenticated-browser-evidence-run-2026-06-15.md
- docs/meta-business-login-sandbox-oauth-profile-selection-run-2026-06-16.md
- docs/meta-business-login-sandbox-implementation-final-report.md
- docs/meta-business-login-sandbox-go-no-go-checklist.md
- docs/meta-business-login-sandbox-runbook-template.md
- docs/security-review.md
- docs/fix-roadmap.md

任務：
建立 controlled callback capture 的安全設計與最小實作方案，目標是在下一次 OAuth consent / callback 前，確保 callback evidence 可以被 redacted capture，但不會寫入 production ConnectedAccount / Channel。

請完成：
1. 檢查目前 /api/instagram/oauth/callback 實作，列出會觸發 token exchange、ConnectedAccount、Channel、workspace linking、sync、webhook 的位置。
2. 設計 sandbox-only callback capture guard：
   - 只在明確 internal header / signed state / allowlisted workspace 條件下啟用。
   - 預設 production callback 行為不變。
   - capture authorization code 時只記錄 hash / redacted evidence，不記錄 raw code。
   - 不交換 token。
   - 不寫 production ConnectedAccount / Channel。
3. 建立測試規格：
   - raw code 不出現在 response、log、audit、snapshot、docs。
   - missing / invalid state 會被拒絕。
   - workspace mismatch 會被拒絕。
   - production write guard 會阻擋 ConnectedAccount / Channel / webhook / sync。
4. 如要 coding，只允許新增 sandbox-only helper、tests、fixtures、docs；不得改正式 callback 行為。
5. 若正式 callback route 必須加入 guard，必須先用文件列出風險與 diff 範圍，不要直接修改。
6. 完成後回填：
   - docs/meta-business-login-sandbox-runbook-template.md
   - docs/meta-business-login-sandbox-experiment-report-template.md
   - docs/meta-business-login-sandbox-go-no-go-checklist.md
   - docs/meta-app-review-checklist.md
   - docs/security-review.md
   - docs/fix-roadmap.md
   - docs/codex-session-log.md

驗證：
- git status
- npm run lint
- npm run build
- targeted sandbox tests；如未跑 npm test，說明原因。

完成後請 commit 並 push。
```

## Current Evidence Baseline

| Gate | Status |
| --- | --- |
| Meta App Dashboard access | Pass |
| Instagram Business Login URL evidence | Pass |
| `force_reauth=true` behavior | Pass |
| IG profile account selection | Pass |
| Selected test profile | Pass: `carry.digital.nomad` |
| Final OAuth consent | Hold |
| Callback evidence | Hold |
| Workspace linking | Hold |
| Channel sync | Hold |
| Production implementation | No-Go |

## Why Not Reopen OAuth Yet

Do not blindly reload the Instagram Business Login URL now.

Because `carry.digital.nomad` has already been selected, the next OAuth attempt may:

- Skip account selection.
- Show final OAuth consent immediately.
- Redirect to the configured production callback.
- Issue an authorization code.

Without a callback capture guard, this may create evidence that is difficult to redact or may trigger production account-linking behavior.

## Required Decision Before OAuth Continuation

Before pressing any OAuth consent / allow / continue action, confirm one of:

1. A sandbox-only redirect URI is registered in Meta App Dashboard.
2. A sandbox-only callback capture guard exists and is tested.
3. A production-safe test workspace, rollback plan, and explicit write expectations are documented.

Until then:

```text
Internal beta: Hold
Production implementation: No-Go
```
