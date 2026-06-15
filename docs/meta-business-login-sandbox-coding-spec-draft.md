# Meta Business Login Sandbox Coding Spec Draft

日期：2026-06-15  
狀態：Draft only，尚未進入 coding  
適用範圍：`meta-business-facebook-sandbox`、`meta-business-instagram-sandbox`

## 文件目的

本文件定義 Meta Business Login sandbox coding 前的技術規格草案。這不是實作任務，不允許直接修改產品功能程式碼。

本草案只描述下一階段若進入 sandbox coding 時應遵守的隔離策略、安全 helper、dry-run callback payload 與不建立 production Channel 的保護條件。

## 明確不修改範圍

本階段仍然不修改：

- 正式 `meta-instagram` OAuth flow。
- 正式 `meta-facebook` OAuth flow。
- 現有 `/api/oauth/[provider]/authorize` route。
- 現有 `/api/oauth/[provider]/callback` route。
- Legacy Meta callback route。
- Instagram callback route。
- 登入按鈕或正式 onboarding UI。
- `.env`、`.env.local`、Vercel env 或任何 production env。
- Prisma schema。
- production ConnectedAccount / Channel。

若下一階段需要 coding，也必須另開任務並再次確認只做 sandbox-only、internal-only、dry-run-first。

## 1. Internal-Only Route 草案

### Route 命名

建議只新增 internal-only sandbox route，不掛到正式 UI：

```text
/internal/oauth/meta-business-facebook-sandbox/authorize
/internal/oauth/meta-business-facebook-sandbox/callback
/internal/oauth/meta-business-instagram-sandbox/authorize
/internal/oauth/meta-business-instagram-sandbox/callback
```

替代方案：

```text
/api/internal/oauth/meta-business-facebook-sandbox/authorize
/api/internal/oauth/meta-business-facebook-sandbox/callback
/api/internal/oauth/meta-business-instagram-sandbox/authorize
/api/internal/oauth/meta-business-instagram-sandbox/callback
```

### Route 存取限制

internal-only route 必須滿足：

| Gate | 要求 |
| --- | --- |
| Auth | 必須有登入使用者 session |
| Workspace | workspace 必須在 sandbox allowlist |
| Environment | 不得在 production 公開入口直接暴露 |
| Feature flag | 必須由 server-side sandbox flag 控制 |
| Provider | 僅允許 sandbox provider id |
| Audit | 只記錄 redacted event |
| Response | 不回傳 token、code、secret、raw state、raw nonce |

### Authorize Route 行為草案

```text
1. 驗證 user session。
2. 驗證 workspace 在 sandbox allowlist。
3. 驗證 provider id 是 sandbox provider。
4. 建立 server-side state record。
5. 產生 nonce，state 內只保存 nonce hash 或 reference。
6. 組 redacted-safe authorize URL。
7. redirect 到 Meta / Instagram authorize URL。
8. audit 記錄 `sandbox_authorize_started`，不得記錄完整 authorize URL。
```

### Callback Route 行為草案

```text
1. 接收 callback query。
2. 若有 `error`，轉成 safe error classification。
3. 驗證 state 是否存在、未過期、未使用。
4. 驗證 nonce。
5. 驗證 user session 與 state user / workspace 一致。
6. 驗證 provider id 與 flow type。
7. server-side code exchange。
8. 查詢或解析 selected Business / Page / IG asset。
9. 執行 dry-run workspace linking / channel sync validation。
10. 回傳 dry-run callback payload。
11. audit 記錄 redacted result。
12. state 標記為 used。
```

## 2. Sandbox Provider Interface 草案

### Provider ID

| Provider ID | 用途 |
| --- | --- |
| `meta-business-facebook-sandbox` | Facebook Login for Business sandbox |
| `meta-business-instagram-sandbox` | Instagram Business Login sandbox |

### Interface 草案

```ts
type SandboxMetaBusinessProviderId =
  | "meta-business-facebook-sandbox"
  | "meta-business-instagram-sandbox";

type SandboxAuthorizeInput = {
  providerId: SandboxMetaBusinessProviderId;
  workspaceId: string;
  userId: string;
  transport: "popup" | "redirect" | "mobile_redirect" | "mobile_in_app_browser";
  returnTo?: string;
};

type SandboxAuthorizeResult = {
  authorizeUrl: string;
  stateId: string;
  redactedAudit: SandboxRedactedAuditEvent;
};

type SandboxCallbackInput = {
  providerId: SandboxMetaBusinessProviderId;
  query: URLSearchParams;
  userId: string;
};

type SandboxCallbackResult =
  | SandboxDryRunSuccessPayload
  | SandboxDryRunErrorPayload;

interface SandboxMetaBusinessProvider {
  id: SandboxMetaBusinessProviderId;
  flowType: "facebook_login_for_business" | "instagram_business_login";
  buildAuthorizeUrl(input: SandboxAuthorizeInput): Promise<SandboxAuthorizeResult>;
  exchangeCode(input: SandboxCodeExchangeInput): Promise<SandboxTokenExchangeResult>;
  getSelectedAssets(input: SandboxAssetLookupInput): Promise<SandboxSelectedAssets>;
  buildDryRunPayload(input: SandboxDryRunInput): SandboxCallbackResult;
}
```

以上是文件草案，不代表本任務要新增 TypeScript 程式碼。

### Provider 規格要求

| 項目 | 要求 |
| --- | --- |
| `id` | 不得與正式 provider id 混淆 |
| `flowType` | 必須可追蹤 Facebook Login for Business 或 Instagram Business Login |
| `buildAuthorizeUrl` | 不得把 raw state 寫入 audit |
| `exchangeCode` | 僅 server-side 執行 |
| `getSelectedAssets` | 必須回傳 redacted-safe mapping |
| `buildDryRunPayload` | 不建立 production Channel |

## 3. State / Nonce / Code Exchange Helper 規格

### State Helper

建議 helper 名稱：

```text
createSandboxOAuthState()
verifySandboxOAuthState()
consumeSandboxOAuthState()
redactSandboxOAuthStateForAudit()
```

State payload 草案：

```json
{
  "stateId": "state_***1234",
  "workspaceId": "internal",
  "userId": "internal",
  "providerId": "meta-business-facebook-sandbox",
  "flowType": "facebook_login_for_business",
  "transport": "popup",
  "returnTo": "/channels/connect/social",
  "nonceHash": "hash_only",
  "createdAt": "iso_time",
  "expiresAt": "iso_time",
  "usedAt": null
}
```

要求：

- `state` 對外只能是不透明字串。
- TTL 建議 5 到 10 分鐘。
- 使用後必須 single-use。
- callback query 中的 workspace id 不可信。
- raw state 不得進入 log、audit、URL、文件或錄影。

### Nonce Helper

建議 helper 名稱：

```text
createSandboxNonce()
hashSandboxNonce()
verifySandboxNonce()
redactSandboxNonceForAudit()
```

要求：

- nonce 必須由 server 產生。
- 只保存 hash 或 server-side reference。
- nonce mismatch 必須回傳 `nonce_mismatch` 或 `invalid_state`。
- raw nonce 不得出現在 log、audit、URL、文件或錄影。

### Code Exchange Helper

建議 helper 名稱：

```text
exchangeSandboxAuthorizationCode()
redactSandboxTokenResponse()
classifySandboxTokenExchangeError()
```

要求：

| 項目 | 要求 |
| --- | --- |
| Exchange location | server-side only |
| Code handling | 不回前端、不進 log、不進 audit |
| Token handling | 加密儲存或 dry-run 不落庫 |
| Error handling | 回傳 safe error type |
| Audit | 只記錄 provider、workspace、request id、error type |

## 4. Redacted Logging Helper 規格

### Helper 草案

建議 helper 名稱：

```text
redactMetaBusinessSandboxValue()
redactMetaBusinessSandboxPayload()
createMetaBusinessSandboxAuditEvent()
assertNoSandboxSensitiveFields()
```

### 禁止記錄欄位

以下欄位不得出現在 log、audit、console、URL、文件、截圖或錄影：

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

### 允許記錄欄位

| 欄位 | 格式 |
| --- | --- |
| request id | `req_***abcd` |
| workspace id | `ws_***1234` |
| provider id | sandbox provider id |
| flow type | enum |
| business id | `bus_***1234` |
| page id | `page_***1234` |
| IG account id | `ig_***1234` |
| error type | safe enum |
| selected asset count | number |

### Audit Event 草案

```json
{
  "event": "meta_business_sandbox_callback_dry_run",
  "providerId": "meta-business-facebook-sandbox",
  "flowType": "facebook_login_for_business",
  "workspaceId": "ws_***1234",
  "requestId": "req_***abcd",
  "selectedAssetCount": 3,
  "selectedBusinessId": "bus_***1234",
  "selectedPageId": "page_***5678",
  "selectedInstagramBusinessAccountId": "ig_***9012",
  "result": "success"
}
```

## 5. Dry-Run Callback Payload 格式

### Success Payload

```json
{
  "status": "success",
  "mode": "dry_run",
  "provider": "meta-business-facebook-sandbox",
  "flowType": "facebook_login_for_business",
  "transport": "popup",
  "workspaceId": "ws_***1234",
  "wouldCreateConnectedAccount": true,
  "wouldCreateChannel": false,
  "selectedBusinessId": "bus_***1234",
  "selectedPageId": "page_***5678",
  "selectedInstagramBusinessAccountId": "ig_***9012",
  "selectedAssetCount": 3,
  "requestId": "req_***abcd"
}
```

### Error Payload

```json
{
  "status": "error",
  "mode": "dry_run",
  "provider": "meta-business-facebook-sandbox",
  "flowType": "facebook_login_for_business",
  "errorType": "workspace_not_allowed",
  "safeMessage": "Sandbox workspace is not allowed.",
  "requestId": "req_***abcd"
}
```

### Error Types

| Error Type | 說明 |
| --- | --- |
| `user_cancel` | 使用者取消授權 |
| `invalid_state` | state 缺失、過期、重放或不匹配 |
| `nonce_mismatch` | nonce 驗證失敗 |
| `workspace_mismatch` | session workspace 與 state workspace 不一致 |
| `workspace_not_allowed` | workspace 不在 sandbox allowlist |
| `wrong_account` | 回傳資產不符合預期 workspace / user |
| `no_eligible_asset` | 找不到可用 Business / Page / IG account |
| `permission_denied` | 使用者拒絕或 scope 不足 |
| `token_exchange_failed` | server-side code exchange 失敗 |
| `channel_sync_failed` | dry-run channel sync validation 失敗 |

## 6. Workspace Allowlist 規格

### Allowlist 來源

此階段不新增 env。下一階段若進入 sandbox coding，allowlist 來源需另行決策。候選方式：

| 來源 | 優點 | 風險 |
| --- | --- | --- |
| server-side config | 不進前端，容易控管 | 仍需部署設定 |
| database feature flag | 可逐 workspace 控制 | 需 schema / table 盤點 |
| existing admin setting | 容易操作 | 需確認權限與 audit |
| env | 簡單 | 本任務明確不修改 env，且 production 混用風險較高 |

本草案建議：sandbox coding 第一階段使用 server-side hardcoded test workspace list 或既有安全設定機制，但必須另開實作任務確認，不在本文件修改。

### Allowlist 驗證規則

```text
1. authorize 前驗證 workspace allowlist。
2. callback 時再次驗證 workspace allowlist。
3. dry-run channel sync 前第三次驗證 workspace allowlist。
4. allowlist fail 回傳 `workspace_not_allowed`。
5. allowlist fail 不得進行 code exchange。
6. allowlist fail 不得建立 ConnectedAccount / Channel。
```

### Workspace Binding

workspace 必須來自 server-side state 與 authenticated user session，不得信任：

- callback query 中的 workspace id。
- 前端 postMessage 送來的 workspace id。
- return URL 中的 workspace id。
- localStorage / sessionStorage 中的 workspace id。

## 7. 不建立 Production Channel 的保護條件

### 必要保護

| 保護條件 | 要求 |
| --- | --- |
| Dry-run default | sandbox callback 預設 `wouldCreateChannel=false` |
| Provider guard | sandbox provider 不得走 production channel sync path |
| Workspace allowlist | 非 allowlist workspace 一律拒絕 |
| Explicit mode | 只有 `mode=dry_run` 可執行第一階段 |
| Audit | audit 必須標示 sandbox / dry_run |
| Token storage | dry-run 階段不得落 production token |
| Channel write guard | production Channel write 必須 blocked |
| Rollback | 停用 sandbox 不影響 production channel |

### Channel Sync Dry-Run 行為

dry-run 可以做：

- 驗證 selected Business / Page / IG asset mapping。
- 驗證 token scope 是否足夠。
- 模擬 would-create ConnectedAccount / Channel payload。
- 回傳 redacted validation result。
- 記錄 redacted audit event。

dry-run 不可以做：

- 建立 production Channel。
- 更新 production Channel。
- 訂閱 production webhook。
- 啟動 production token refresh。
- 把 token 回傳前端。
- 把 token / code / secret 寫入 metadata。

## 8. 正式 Flow 保持不變

即使進入 sandbox coding，仍必須明確保持：

| 正式項目 | 狀態 |
| --- | --- |
| `meta-instagram` provider | 不修改 |
| `meta-facebook` provider | 不修改 |
| `/api/oauth/[provider]/authorize` | 不修改 |
| `/api/oauth/[provider]/callback` | 不修改 |
| `/api/meta/oauth/start` | 不修改 |
| `/api/meta/oauth/callback` | 不修改 |
| `/api/instagram/oauth/callback` | 不修改 |
| 正式登入按鈕 | 不修改 |
| env | 不修改 |
| Prisma schema | 不修改 |
| production ConnectedAccount | 不修改 |
| production Channel | 不修改 |

若任何下一階段任務需要修改上述項目，必須先建立新的 production implementation ADR，並通過 App Review、callback security、workspace linking、channel sync、redaction、rollback gates。

## 進入 Coding 前 Checklist

| Gate | 必須完成 | 狀態 |
| --- | --- | --- |
| Go/no-go checklist | Go to sandbox coding |  |
| App Review docs | 至少有 demo script / permission table 草案 |  |
| Internal route spec | route 命名與 access guard 已確認 |  |
| Provider interface | sandbox provider interface 已確認 |  |
| State helper | TTL / single-use / user / workspace binding 已確認 |  |
| Nonce helper | hash / verify / mismatch handling 已確認 |  |
| Code exchange helper | server-side only 已確認 |  |
| Redaction helper | 禁止欄位與 audit format 已確認 |  |
| Dry-run payload | success / error payload 已確認 |  |
| Workspace allowlist | 來源與驗證點已確認 |  |
| Production Channel guard | 不建立 production Channel 已確認 |  |
| Rollback | 停用 sandbox 不影響正式 flow 已確認 |  |

## 下一個建議 Codex prompt

```text
請只新增 / 更新文件，不要修改產品功能程式碼，不要改 OAuth flow，不要改 callback route，不要改登入按鈕，不要改 env。

請根據 docs/meta-business-login-sandbox-coding-spec-draft.md，建立 sandbox coding 風險評估與測試計畫，檔案路徑為 docs/meta-business-login-sandbox-coding-risk-test-plan.md。

內容需包含：
1. internal-only route 風險
2. sandbox provider interface 風險
3. state / nonce / code exchange 測試項目
4. redacted logging 測試項目
5. dry-run callback payload 測試項目
6. workspace allowlist 測試項目
7. production Channel write guard 測試項目
8. sandbox coding 可以開始前的最小測試清單

完成後請執行 git status、npm run lint、npm run build。npm test 可視情況略過，但要說明原因。
```
