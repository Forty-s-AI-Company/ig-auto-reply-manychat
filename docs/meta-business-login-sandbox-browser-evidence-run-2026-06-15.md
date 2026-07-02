# Meta Business Login Sandbox Browser Evidence Run - 2026-06-15

Date: 2026-06-15  
Status: Hold  
Scope: Browser-based external evidence attempt for Meta Business Login sandbox

Update:

```text
Superseded by authenticated evidence run:
docs/meta-business-login-sandbox-authenticated-browser-evidence-run-2026-06-15.md
```

The first run stopped at Facebook login. After the browser was authenticated, the follow-up run captured Meta App Dashboard, Instagram Business Login URL, permissions, business login settings, and partial account selection evidence.

## Summary

This run attempted to move from local sandbox scaffold validation into browser-based external evidence collection.

Result:

```text
Local dev server guard evidence: Pass
Meta Developers access: Hold
Meta dialog / account selection evidence: Not captured
Internal beta: No-Go
Production implementation: No-Go
```

No product OAuth flow, callback route, login button, env, Prisma schema, production ConnectedAccount, or production Channel write path was changed.

## Browser Tooling

| Browser surface | Result | Notes |
| --- | --- | --- |
| Chrome plugin | Unavailable | The configured Chrome skill path did not contain `scripts/browser-client.mjs`, so Chrome session automation could not be used. |
| In-app Browser | Used | Opened Meta Developers / Meta for Business login flow. |

## Local Dev Server Check

Local server:

```text
http://localhost:3041
```

Health check:

```text
GET /api/health
Status: 200
```

Observed process:

```text
LocalPort: 3041
State: Listen
```

## Local Internal Route Browser Result

The in-app Browser could not directly open the internal API route:

```text
http://localhost:3041/api/internal/oauth/meta-business-facebook-sandbox/authorize?transport=popup
```

Browser result:

```text
net::ERR_BLOCKED_BY_CLIENT
```

The same result occurred when using `127.0.0.1`.

Interpretation:

- This appears to be a browser client navigation limitation for the API URL.
- It is not evidence that the app route failed.
- HTTP-level verification was used for the route guard checks below.

## Local HTTP Guard Evidence

Authorize route without an authenticated admin browser session:

```text
GET /api/internal/oauth/meta-business-facebook-sandbox/authorize?transport=popup
Status: 401
Body: {"status":"error","mode":"dry_run","errorType":"unauthorized"}
```

Callback route with sandbox header but without an authenticated admin browser session:

```text
GET /api/internal/oauth/meta-business-instagram-sandbox/callback?code=[REDACTED_CODE]&state=[REDACTED_STATE]
Header: x-inboxpilot-sandbox=sbl-01
Status: 401
Body: {"status":"error","mode":"dry_run","errorType":"unauthorized"}
```

Interpretation:

- Internal sandbox routes correctly require an authenticated admin session.
- The callback did not expose raw code or raw state in the response body.
- No token exchange, production write, webhook registration, or channel sync occurred.

## Meta Developers Browser Result

Opened:

```text
https://developers.facebook.com/apps/
```

Observed redirect:

```text
https://business.facebook.com/business/loginpage/?next=[REDACTED_NEXT_URL]
```

Visible page:

```text
Meta for Developers login page
Buttons:
- 使用 Facebook 帳號繼續
- 建立新帳號
- 使用受管理的 Meta 帳號登入
```

Clicked:

```text
使用 Facebook 帳號繼續
```

Observed final page:

```text
https://www.facebook.com/login/?next=[REDACTED_NEXT_URL]&request_id=[REDACTED_REQUEST_ID]
Title: Facebook
Visible form:
- 電子郵件地址或手機號碼
- 密碼
- 登入
- 忘記密碼？
- 建立新帳號
```

No credentials, OTP, 2FA code, CAPTCHA, app secret, token, authorization code, or sensitive browser storage was read or entered.

## Meta Evidence Status

| Evidence | Status | Reason |
| --- | --- | --- |
| Meta App Dashboard access | Hold | Browser reached Facebook login screen only. |
| Facebook Login for Business dialog | Not captured | Requires authenticated Meta / developer account session. |
| Instagram Business Login dialog | Not captured | Requires authenticated Meta / developer account session and app configuration. |
| Business selection UX | Not captured | Requires real Meta login and configured app. |
| Page selection UX | Not captured | Requires real Meta login and configured app. |
| IG account selection UX | Not captured | Requires real Meta login and configured app. |
| Redacted callback evidence from Meta | Not captured | No real OAuth authorization was started. |
| Reviewer demo recording | Not captured | App Review demo cannot be recorded before dashboard and dialog access. |

## Gate Result

| Gate | Status | Evidence |
| --- | --- | --- |
| Local route guard | Pass | Unauthenticated access returned 401 dry-run error. |
| Redaction | Pass for local guard response | Raw code / state were not returned in local callback guard response. |
| Production write guard | Pass by route protection | Request stopped before token exchange or write path. |
| External Meta evidence | Hold | Browser requires Meta login. |
| App Review | Hold | Missing real dialog, account selection, callback, and reviewer evidence. |
| Internal beta | No-Go | External evidence missing. |
| Production implementation | No-Go | App Review and real execution evidence missing. |

## Next Browser Step

To continue external evidence collection, the browser must be in one of these states:

1. A Chrome automation session with the user's existing Meta login state available.
2. The in-app Browser manually authenticated into the correct Meta / Facebook developer account.

After login, continue with:

```text
https://developers.facebook.com/apps/
```

Then capture redacted evidence for:

- Target Meta app id / app name.
- Facebook Login for Business settings.
- Instagram Business Login settings.
- Valid OAuth redirect URI.
- Permission / feature status.
- Business / Page / IG account selection dialog.
- Redacted callback response.

Do not record or paste raw token, authorization code, app secret, client secret, raw state, raw nonce, full callback URL, reusable authorize URL, password, OTP, or unmasked Meta asset ids.
