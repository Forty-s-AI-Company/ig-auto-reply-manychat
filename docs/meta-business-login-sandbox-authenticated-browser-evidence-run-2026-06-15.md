# Meta Business Login Sandbox Authenticated Browser Evidence Run - 2026-06-15

Date: 2026-06-15  
Status: Partial Pass / Hold before account authorization  
Scope: Authenticated in-app Browser evidence for InboxPilot Meta App Dashboard and Instagram Business Login OAuth

## Summary

This run continued after the in-app Browser was authenticated into Meta Developers.

Result:

```text
Meta App Dashboard access: Pass
InboxPilot app evidence: Pass
Instagram Business Login URL evidence: Pass
Instagram profile account selection UX evidence: Partial Pass
Final OAuth authorization / callback evidence: Not captured
Internal beta: Hold
Production implementation: No-Go
```

No product OAuth flow, callback route, login button, env, Prisma schema, production ConnectedAccount, or production Channel write path was changed.

No Meta App Dashboard setting was saved. No app secret, raw token, authorization code, raw state, raw nonce, full callback URL, password, OTP, or browser storage was read or recorded.

## App Dashboard Evidence

Opened:

```text
https://developers.facebook.com/apps/
```

Observed apps:

| App | App ID | Mode | Business |
| --- | --- | --- | --- |
| InboxPilot | `924285843989683` | Live / 上線 | `零元兄弟` |
| threads_autopo | `927897679594033` | Live / 上線 | Not recorded |

InboxPilot dashboard:

```text
https://developers.facebook.com/apps/924285843989683/dashboard/?business_id=[REDACTED_BUSINESS_ID]
```

Observed:

- App name: `InboxPilot`
- App ID: `924285843989683`
- App mode: Live / 上線
- Required actions: none displayed
- App rate limit: 0% used, 100% remaining
- User rate limit: 0 throttled users

Observed use cases:

- 管理 Instagram 的訊息和內容
- 管理粉絲專頁的所有內容
- 透過 Messenger from Meta 與顧客互動

## Instagram API Use Case Evidence

Opened:

```text
https://developers.facebook.com/apps/924285843989683/use_cases/customize/?use_case_enum=INSTAGRAM_BUSINESS&selected_tab=API-Setup&product_route=instagram-business&business_id=[REDACTED_BUSINESS_ID]
```

Observed use case:

```text
Instagram API
```

Observed Instagram app:

| Field | Value |
| --- | --- |
| Instagram app name | `manychat-auto-reply-IG` |
| Instagram app ID | `1530009762118735` |
| Instagram app secret | Masked by Meta UI; not revealed |

Required messaging permissions shown by Meta:

- `instagram_business_basic`
- `instagram_business_manage_comments`
- `instagram_business_manage_messages`

## Instagram Business Login URL Evidence

Meta displayed an embedded Instagram Business Login authorize URL.

Redacted URL:

```text
https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=1530009762118735&redirect_uri=[REDACTED_CALLBACK_URL]&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights
```

Observed query parameters:

| Parameter | Observed value |
| --- | --- |
| OAuth host | `www.instagram.com` |
| OAuth path | `/oauth/authorize` |
| `force_reauth` | `true` |
| `client_id` | `1530009762118735` |
| `redirect_uri` | `[REDACTED_CALLBACK_URL]` |
| `response_type` | `code` |
| `scope` | `instagram_business_basic`, `instagram_business_manage_messages`, `instagram_business_manage_comments`, `instagram_business_content_publish`, `instagram_business_manage_insights` |

Important finding:

- This is Instagram Business Login, not the existing generic Facebook OAuth dialog.
- The Meta-provided URL includes `force_reauth=true`.
- It uses `response_type=code`.
- It does not use `auth_type=reauthenticate`, `auth_type=rerequest`, `prompt`, `login_hint`, or `display` in the observed Meta-provided Instagram URL.

## Business Login Settings Evidence

Opened the "商家登入設定" dialog from the Instagram API setup page.

Observed:

| Field | Status |
| --- | --- |
| OAuth redirect URI | Configured; value redacted |
| Deauthorize callback URL | Configured; value redacted |
| Data deletion request URL | Configured; value redacted |
| Save button | Disabled |

Interpretation:

- The dialog was read-only during this run.
- No setting was modified or saved.

## Permissions And Features Evidence

Opened:

```text
https://developers.facebook.com/apps/924285843989683/use_cases/customize/permissions/?use_case_enum=INSTAGRAM_BUSINESS&selected_tab=permissions&product_route=use_cases&business_id=[REDACTED_BUSINESS_ID]
```

Relevant permissions / features observed:

| Permission / feature | Observed status |
| --- | --- |
| `business_management` | 可供測試 |
| `instagram_basic` | 可供測試 |
| `instagram_business_basic` | 可供測試 |
| `instagram_business_manage_comments` | 可供測試 |
| `instagram_business_manage_messages` | 可供測試 |
| `instagram_manage_messages` | 可供測試 |
| `pages_read_engagement` | 可供測試 |
| `pages_show_list` | 可供測試 |
| `instagram_business_content_publish` | 新增 |
| `instagram_business_manage_insights` | 新增 |

Important finding:

- The Meta-provided Instagram Business Login URL includes `instagram_business_content_publish` and `instagram_business_manage_insights`, but the permissions table showed these as `新增` rather than `可供測試`.
- Before App Review or beta, confirm whether those scopes are required for InboxPilot's current IG messaging flow. If not required, they should be excluded from the sandbox production candidate to reduce App Review risk.

## OAuth Dialog / Account Selection UX Evidence

Opened the Meta-provided Instagram Business Login authorize URL in a new browser tab.

Observed redirect:

```text
https://www.instagram.com/accounts/login/?force_authentication&platform_app_id=1530009762118735&next=[REDACTED_NEXT_URL]&enable_fb_login
```

Observed login screen:

- Instagram login form
- Fields: phone / username / email, password
- `使用 Facebook 帳號登入` button
- No raw authorization code or callback payload

After clicking `使用 Facebook 帳號登入`, Instagram displayed profile account selection:

```text
ling.yun.energy
carry.digital.nomad
使用其他個人檔案
```

Interpretation:

- `force_reauth=true` caused the flow to require re-authentication.
- The flow showed a real Instagram profile selection surface after Facebook login.
- This is closer to the ManyChat account selection UX than the previous "allow / cancel only" behavior.
- The test stopped before selecting a profile or approving the OAuth authorization to avoid linking the wrong account or creating a real callback.

## Callback Evidence

Not captured.

Reason:

- The run intentionally stopped before selecting an Instagram profile and before clicking any final OAuth allow / authorize action.
- No authorization code was issued.
- No callback URL containing `code` was visited.
- No production ConnectedAccount / Channel was created or updated.

## Redaction Check

The run did not record:

- App secret
- Access token
- Refresh token
- Authorization code
- Raw state
- Raw nonce
- Full callback URL
- Password
- OTP / 2FA code
- Browser cookies
- Local storage
- Session storage

Known redacted items:

- Business id
- Callback URL
- OAuth `next` URL
- Request / logger id

## Go / Hold / No-Go

| Gate | Status | Evidence |
| --- | --- | --- |
| Meta App Dashboard access | Pass | InboxPilot app dashboard visible |
| Instagram API setup evidence | Pass | Instagram app name / app id / required permissions visible |
| Instagram Business Login URL evidence | Pass | URL includes `force_reauth=true` and `response_type=code` |
| Business login settings evidence | Pass | Redirect / deauth / data deletion fields configured and read-only |
| Permissions evidence | Partial Pass | Required messaging permissions testable; content publish / insights show `新增` |
| Account selection UX evidence | Partial Pass | Instagram profile selection visible after Facebook login |
| Callback evidence | Hold | Stopped before profile selection / final OAuth authorization |
| Redaction gate | Pass for captured evidence | No raw secret / token / code captured |
| Internal beta | Hold | Needs explicit chosen test IG profile and controlled callback run |
| Production implementation | No-Go | Needs App Review, callback evidence, workspace linking proof, channel sync proof, rollback proof |

## Next Controlled Browser Step

Next run should be a controlled authorization run with an explicitly chosen test Instagram profile.

Required before continuing:

- Confirm the intended test IG profile to select from:
  - `ling.yun.energy`
  - `carry.digital.nomad`
- Confirm the target workspace expected to receive dry-run evidence.
- Confirm the callback run should stop before production account creation unless the callback route is sandbox-only.

Do not proceed to production implementation from this evidence alone.
