# Meta Business Login Sandbox Coding Risk & Test Plan

## 2026-06-15 - SBL-06 To SBL-08 Implemented Coverage

Status: targeted helper tests passed.

| Coverage Area | Status | Evidence |
| --- | --- | --- |
| SBL-06 dry-run payload builder | Implemented | `src/lib/meta-business-sandbox-dry-run.ts` |
| SBL-07 workspace allowlist guard | Implemented | `src/lib/meta-business-sandbox-allowlist.ts` |
| SBL-08 production write guard | Implemented | `src/lib/meta-business-sandbox-write-guard.ts` |
| Targeted tests | Passed | 6 tests |

Remaining risk:

- Real Meta dialog UX and App Review evidence have not been collected.
- Internal beta and production implementation remain blocked.

## 2026-06-15 - SBL-05 Implemented Redaction Coverage

Status: targeted helper tests passed.

| Coverage Area | Status | Evidence |
| --- | --- | --- |
| Token redaction | Implemented | `redactMetaBusinessSandboxPayload` |
| Code redaction | Implemented | `redactMetaBusinessSandboxPayload` |
| Secret redaction | Implemented | `redactMetaBusinessSandboxPayload` |
| State / nonce redaction | Implemented | `redactMetaBusinessSandboxPayload` |
| Callback / authorize URL redaction | Implemented | `redactMetaBusinessSandboxPayload` |
| Business / Page / IG id masking | Implemented | `redactMetaBusinessSandboxValue` |
| Redacted audit event | Implemented | `createMetaBusinessSandboxAuditEvent` |
| Unsafe payload detection | Implemented | `assertNoSandboxSensitiveFields` |

Remaining risk:

- Production audit behavior remains unchanged.
- SBL-06 should consume this helper for dry-run callback payload evidence.

## 2026-06-15 - SBL-04 Implemented Code Exchange Coverage

Status: targeted helper tests passed.

| Coverage Area | Status | Evidence |
| --- | --- | --- |
| Dry-run exchange skip | Implemented | `exchangeAttempted=false` by default |
| Missing code error | Implemented | `code_required` |
| Missing redirect URI error | Implemented | `redirect_uri_required` |
| Missing exchange client error | Implemented | `exchange_client_required` |
| Injected exchange success redaction | Implemented | `[REDACTED_CODE]`, `[REDACTED_TOKEN]` |
| Injected exchange failure redaction | Implemented | Safe `errorType` only |

Remaining risk:

- Real Meta token exchange is still blocked.
- SBL-05 must centralize redacted logging / audit payloads before broader callback work.

## 2026-06-15 - SBL-03 Implemented State / Nonce Coverage

Status: targeted helper tests passed.

| Coverage Area | Status | Evidence |
| --- | --- | --- |
| State generation | Implemented | `createSandboxOAuthState` |
| Nonce generation | Implemented | `createSandboxOAuthState` |
| State / nonce hashing | Implemented | `stateHash`, `nonceHash` only |
| Redacted audit helper | Implemented | `redactSandboxOAuthStateForAudit` |
| State verification | Implemented | `verifySandboxOAuthState` |
| Expiration rejection | Implemented | `state_expired` |
| Replay rejection | Implemented | `state_replayed` |
| Workspace / user binding | Implemented | `workspace_mismatch` |
| Provider binding | Implemented | `invalid_state` |
| Nonce verification | Implemented | `nonce_mismatch` |

Remaining risk before broader sandbox flow:

- SBL-04 must not perform real Meta token exchange unless a later sandbox-only task explicitly enables it.
- SBL-05 should centralize redaction for route / audit payloads.
- State helpers are not wired into production OAuth state or existing callback routes.

## 2026-06-15 - SBL-01 Implemented Route Skeleton Coverage

Status: targeted skeleton tests passed.

| Coverage Area | Status | Evidence |
| --- | --- | --- |
| Internal authorize route skeleton | Implemented | `src/app/api/internal/oauth/[provider]/authorize/route.ts` |
| Internal callback route skeleton | Implemented | `src/app/api/internal/oauth/[provider]/callback/route.ts` |
| Sandbox helper | Implemented | `src/lib/meta-business-sandbox.ts` |
| Production environment block | Implemented | `sandbox_disabled_in_production` |
| Admin-only access | Implemented | `internal_only` |
| Sandbox header guard | Implemented | `sandbox_header_required` |
| Sandbox provider guard | Implemented | `unsupported_provider` |
| Workspace allowlist guard | Implemented | `workspace_not_allowed` |
| Redacted authorize dry-run payload | Implemented | SBL-01 targeted tests |
| Redacted callback dry-run payload | Implemented | SBL-01 targeted tests |
| Production write guard | Implemented | SBL-01 targeted tests |

Remaining risk before broader sandbox flow:

- SBL-03 must add state / nonce helper tests before callback validation is considered complete.
- SBL-04 must keep code exchange disabled or stubbed unless an approved sandbox-only token exchange task exists.
- Internal beta and production implementation remain blocked.

## 2026-06-15 - SBL-09 Implemented Test Scaffold Coverage

Status: targeted scaffold tests passed.

| Coverage Area | Status | Evidence |
| --- | --- | --- |
| Safe fixture redaction | Implemented | `tests/fixtures/sbl09/safe/sbl09.callback.valid-dry-run.expected-redacted.fixture.json` |
| Unsafe fixture detection | Implemented | `tests/fixtures/sbl09/unsafe/sbl09.redaction.raw-code.unsafe.fixture.json` |
| Redaction assertion helper | Implemented | `tests/helpers/sbl09-redaction.ts` |
| Dry-run callback payload validation | Implemented | `tests/meta-business-login-sandbox-sbl09.test.ts` |
| Callback URL / authorize URL rejection | Implemented | `tests/meta-business-login-sandbox-sbl09.test.ts` |
| Production write guard fixture | Implemented | `tests/fixtures/sbl09/safe/sbl09.write-guard.channel-create-blocked.safe.fixture.json` |
| Guarded operations list | Implemented | ConnectedAccount, Channel, webhook, sync, and token refresh operations covered |

Remaining risk before SBL-01:

- SBL-01 must still avoid production UI, existing OAuth flow, existing callback route, env, Prisma schema, and production ConnectedAccount / Channel writes.
- SBL-01 must reuse the SBL-09 redaction assertions or equivalent checks.
- SBL-01 must remain dry-run-first and cannot perform real Meta token exchange.

日期：2026-06-15  
狀態：Test plan only，尚未進入 sandbox coding  
適用範圍：`meta-business-facebook-sandbox`、`meta-business-instagram-sandbox`

## 文件目的

本文件根據 `docs/meta-business-login-sandbox-coding-spec-draft.md`，整理 sandbox coding 開始前必須理解的風險與最小測試計畫。

本文件只新增文件規格，不授權修改產品功能程式碼。正式 OAuth flow、callback route、登入按鈕、env、Prisma schema、production ConnectedAccount、production Channel 仍維持不變。

## 明確不修改範圍

本測試計畫不修改：

- `meta-instagram` provider。
- `meta-facebook` provider。
- `/api/oauth/[provider]/authorize`。
- `/api/oauth/[provider]/callback`。
- `/api/meta/oauth/start`。
- `/api/meta/oauth/callback`。
- `/api/instagram/oauth/callback`。
- 正式登入按鈕與 onboarding UI。
- `.env`、`.env.local`、Vercel env 或任何 production env。
- Prisma schema。
- production ConnectedAccount / Channel。

## 1. Internal-Only Route 風險

### 主要風險

| 風險 | Severity | 說明 | 緩解方式 |
| --- | --- | --- | --- |
| internal route 被正式使用者存取 | High | route 若沒有 auth / allowlist / flag，可能變成公開 OAuth 入口 | server-side auth、workspace allowlist、sandbox flag |
| sandbox route 誤接正式 provider | High | provider id 混淆會影響正式 OAuth flow | 僅允許 sandbox provider enum |
| callback URL 被完整記錄 | High | URL 可能包含 code / state | 禁止記錄 full callback URL |
| route 回傳敏感資料 | High | code、token、raw state 不可回前端 | response schema 僅允許 redacted payload |
| popup / redirect 行為與正式 UI 混用 | Medium | 可能被誤掛到正式登入按鈕 | route 不出現在正式 UI registry |

### 測試項目

| Test ID | 測試項目 | 預期結果 |
| --- | --- | --- |
| R-001 | 未登入使用者呼叫 authorize | 回傳 auth required，不建立 state |
| R-002 | 不在 allowlist 的 workspace 呼叫 authorize | 回傳 `workspace_not_allowed` |
| R-003 | 非 sandbox provider id 呼叫 route | 回傳 `unsupported_provider` 或 404 |
| R-004 | callback 缺少 state | 回傳 `invalid_state` |
| R-005 | callback URL 不進 log / audit | redaction 搜尋通過 |
| R-006 | route response 不含 code / token / raw state | redaction 搜尋通過 |

## 2. Sandbox Provider Interface 風險

### 主要風險

| 風險 | Severity | 說明 | 緩解方式 |
| --- | --- | --- | --- |
| provider id 與正式 provider 混淆 | High | 可能走到 production sync path | 使用 `meta-business-*-sandbox` 明確命名 |
| `exchangeCode` 被 client side 呼叫 | High | authorization code 外洩 | 僅允許 server-side helper |
| `getSelectedAssets` 回傳 raw payload | High | Meta API raw response 可能含敏感資訊 | 回傳 normalized + redacted mapping |
| provider interface 缺少 flowType | Medium | App Review / audit 難追蹤 | 強制 `flowType` enum |
| error type 不一致 | Medium | UI / audit / runbook 難判讀 | 統一 safe error enum |

### 測試項目

| Test ID | 測試項目 | 預期結果 |
| --- | --- | --- |
| P-001 | provider id 非 sandbox enum | 拒絕執行 |
| P-002 | build authorize URL | 不包含 raw state、token、secret |
| P-003 | exchange code failure | 回傳 `token_exchange_failed` safe error |
| P-004 | selected assets normalize | 只回傳 redacted Business / Page / IG ids |
| P-005 | dry-run payload | `wouldCreateChannel=false` |

## 3. State / Nonce / Code Exchange 測試項目

### State Tests

| Test ID | 測試項目 | 預期結果 |
| --- | --- | --- |
| S-001 | 建立 state | state 對外是不透明字串 |
| S-002 | state TTL 未過期 | 驗證通過 |
| S-003 | state TTL 過期 | 回傳 `invalid_state` |
| S-004 | state 重放 | 第二次使用回傳 `invalid_state` |
| S-005 | state provider mismatch | 回傳 `invalid_state` |
| S-006 | state workspace mismatch | 回傳 `workspace_mismatch` |
| S-007 | raw state redaction | log / audit / docs 不含 raw state |

### Nonce Tests

| Test ID | 測試項目 | 預期結果 |
| --- | --- | --- |
| N-001 | nonce 正確 | 驗證通過 |
| N-002 | nonce mismatch | 回傳 `nonce_mismatch` |
| N-003 | nonce 缺失 | 回傳 `invalid_state` 或 `nonce_mismatch` |
| N-004 | raw nonce redaction | log / audit / docs 不含 raw nonce |

### Code Exchange Tests

| Test ID | 測試項目 | 預期結果 |
| --- | --- | --- |
| C-001 | code exchange 只在 server-side 執行 | code 不出現在 browser console / response |
| C-002 | code exchange success | token response 被 redacted 或加密處理 |
| C-003 | code exchange failure | 回傳 `token_exchange_failed` safe error |
| C-004 | authorization code redaction | log / audit / docs 不含 code |
| C-005 | token redaction | log / audit / docs 不含 token |

## 4. Redacted Logging 測試項目

### 禁止項目

以下任一項出現即測試失敗：

- access token
- refresh token
- authorization code
- app secret
- client secret
- webhook verify token
- raw state
- raw nonce
- full callback URL
- reusable authorize URL
- Meta API raw error 中的敏感欄位

### 測試項目

| Test ID | 測試項目 | 預期結果 |
| --- | --- | --- |
| L-001 | authorize started audit | 只含 provider、workspace、request id |
| L-002 | callback success audit | 只含 redacted selected asset ids |
| L-003 | callback error audit | 只含 safe error type |
| L-004 | Meta API error logging | raw response 被清理 |
| L-005 | browser console 搜尋 | 不含 token / code / state / nonce |
| L-006 | server log 搜尋 | 不含禁止項目 |
| L-007 | audit log 搜尋 | 不含禁止項目 |
| L-008 | screenshot / recording 檢查 | 不含可重放 URL 或敏感資料 |

## 5. Dry-Run Callback Payload 測試項目

### Success Payload Tests

| Test ID | 測試項目 | 預期結果 |
| --- | --- | --- |
| D-001 | success payload schema | `status=success`、`mode=dry_run` |
| D-002 | channel guard | `wouldCreateChannel=false` |
| D-003 | connected account preview | `wouldCreateConnectedAccount` 僅為 preview |
| D-004 | asset id redaction | Business / Page / IG ids 已 redacted |
| D-005 | request id | request id 可追蹤但不可重放 |
| D-006 | no token in payload | payload 不含 token |
| D-007 | no code in payload | payload 不含 authorization code |

### Error Payload Tests

| Test ID | 測試項目 | 預期結果 |
| --- | --- | --- |
| E-001 | invalid state payload | safe `invalid_state` error |
| E-002 | workspace not allowed payload | safe `workspace_not_allowed` error |
| E-003 | wrong account payload | safe `wrong_account` error |
| E-004 | permission denied payload | safe `permission_denied` error |
| E-005 | token exchange failed payload | safe `token_exchange_failed` error |
| E-006 | no raw Meta error | payload 不含 Meta raw error |

## 6. Workspace Allowlist 測試項目

### 主要風險

| 風險 | Severity | 說明 | 緩解方式 |
| --- | --- | --- | --- |
| allowlist 只在 authorize 檢查 | High | callback 可被重放或換 workspace | authorize / callback / dry-run sync 都檢查 |
| 信任 query workspace | High | 可造成跨 workspace linking | workspace 只信 server-side state |
| allowlist 來源混用 production env | Medium | env 管理風險 | 本階段不新增 env，來源另案決策 |
| allowlist audit 不足 | Medium | 事後難追蹤測試資料 | redacted audit event |

### 測試項目

| Test ID | 測試項目 | 預期結果 |
| --- | --- | --- |
| W-001 | allowlist workspace authorize | 通過 |
| W-002 | non-allowlist workspace authorize | `workspace_not_allowed` |
| W-003 | allowlist workspace callback | 通過 |
| W-004 | callback 時 workspace 被移出 allowlist | `workspace_not_allowed` |
| W-005 | dry-run sync 前 allowlist 檢查 | 非 allowlist 被拒絕 |
| W-006 | query workspace spoofing | 不被信任 |
| W-007 | postMessage workspace spoofing | 不被信任 |
| W-008 | return URL workspace spoofing | 不被信任 |

## 7. Production Channel Write Guard 測試項目

### 主要風險

| 風險 | Severity | 說明 | 緩解方式 |
| --- | --- | --- | --- |
| dry-run 寫入 production Channel | Critical | 會污染正式資料 | `wouldCreateChannel=false` + write guard |
| sandbox provider 走 production sync path | Critical | 可能建立錯誤 IG channel | provider guard |
| token 被存到 production account | High | 造成 secret / tenant 風險 | dry-run 不落 production token |
| webhook 太早訂閱 | High | 尚未驗證資產就進 production 行為 | account validation 後才可進下一階段 |
| channel identity 不穩定 | Medium | display name 變更造成重複或錯連 | 以 IG account id 為 identity |

### 測試項目

| Test ID | 測試項目 | 預期結果 |
| --- | --- | --- |
| G-001 | dry-run callback success | 不建立 production Channel |
| G-002 | dry-run callback error | 不建立 production Channel |
| G-003 | sandbox provider sync attempt | 被 production sync guard 阻擋 |
| G-004 | non-allowlist sync attempt | 被拒絕 |
| G-005 | would-create preview | 只回傳 preview payload |
| G-006 | token storage check | 不寫 production token |
| G-007 | webhook subscription check | 不訂閱 production webhook |
| G-008 | production channel unchanged | 測試前後 production Channel count 不變 |

## 8. Sandbox Coding 可以開始前的最小測試清單

進入 sandbox coding 前，至少要先完成以下文件與測試準備：

| Gate | 最小要求 | 狀態 |
| --- | --- | --- |
| Go/no-go decision | 明確是 `Go to sandbox coding`，不是 internal beta 或 production |  |
| App Review docs | demo script、permission table、reviewer assets 草案已存在 |  |
| Internal route spec | route 命名、auth、allowlist、flag、audit 規格已確認 |  |
| Provider interface | sandbox provider id、flowType、method contract 已確認 |  |
| State tests | TTL、single-use、provider binding、workspace binding 已列測 |  |
| Nonce tests | nonce hash、verify、mismatch 已列測 |  |
| Code exchange tests | server-side only、failure classification、redaction 已列測 |  |
| Redaction tests | log / audit / console / docs 搜尋清單已確認 |  |
| Dry-run payload tests | success / error schema 已確認 |  |
| Workspace allowlist tests | authorize / callback / dry-run sync 三段檢查已列測 |  |
| Production Channel guard tests | 不建立 Channel、不寫 token、不訂閱 webhook 已列測 |  |
| Rollback plan | 停用 sandbox 不影響正式 flow 已確認 |  |

若上述任一項未完成，結論應維持 Hold，不應開始 coding。

## 測試資料與證據要求

所有測試證據必須 redacted：

| 證據類型 | 要求 |
| --- | --- |
| authorize URL | 只能保存 redacted URL，不得可重放 |
| callback payload | 只能保存 redacted payload |
| server log | 不含禁止項目 |
| audit log | 不含禁止項目 |
| browser console | 不含禁止項目 |
| screenshot / recording | 不含 token、code、secret、raw state、full URL |
| report / runbook | 不含可識別真實外部帳號的敏感資料 |

## 最終結論模板

```text
Sandbox coding readiness:
- Ready / Hold / No-Go:

Required completed checks:
- Internal-only route:
- Sandbox provider interface:
- State / nonce / code exchange:
- Redacted logging:
- Dry-run callback payload:
- Workspace allowlist:
- Production Channel write guard:
- Rollback:

Blocking issues:

Required follow-up:

Owner:

Target review date:
```

## 下一個建議 Codex prompt

```text
請只新增 / 更新文件，不要修改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env。

請整理目前所有 Meta Business Login sandbox 文件，建立一份文件索引與決策路徑圖，檔案路徑為 docs/meta-business-login-sandbox-doc-index.md。

內容需包含：
1. 每份文件的用途
2. 文件閱讀順序
3. 從研究、ADR、實驗規格、runbook、報告、go/no-go 到 coding spec 的決策路徑
4. 哪些文件仍是 template / draft
5. 哪些 gate 尚未通過
6. 明確列出目前仍不可進入 production implementation

完成後請執行 git status、npm run lint、npm run build。npm test 可視情況略過，但要說明原因。
```
