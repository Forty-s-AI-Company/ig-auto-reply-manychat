# Meta Business Login Sandbox OAuth Profile Selection Run - 2026-06-16

Date: 2026-06-16  
Status: Partial Pass / Hold before callback  
Scope: Instagram Business Login profile selection continuation

## Summary

This run continued from the Instagram Business Login OAuth URL after the in-app Browser was already authenticated into Meta / Instagram.

Result:

```text
Instagram forced login screen: Pass
Instagram profile account selection: Pass
Selected test profile: carry.digital.nomad
Final OAuth consent screen: Not shown
Callback evidence: Not captured
Production implementation: No-Go
```

No product OAuth flow, callback route, login button, env, Prisma schema, production ConnectedAccount, or production Channel write path was changed.

No app secret, access token, authorization code, raw state, raw nonce, full callback URL, password, OTP, cookie, local storage, or session storage was read or recorded.

## Starting URL

The browser started on the Meta-provided Instagram Business Login URL in its redirected login form state:

```text
https://www.instagram.com/accounts/login/?force_authentication&platform_app_id=1530009762118735&next=[REDACTED_NEXT_URL]&enable_fb_login
```

Observed:

- Title: `登入 • Instagram`
- Login fields:
  - Phone / username / email
  - Password
- Button:
  - `使用 Facebook 帳號登入`

## Account Selection Step

Clicked:

```text
使用 Facebook 帳號登入
```

Observed Instagram profile account selection:

```text
ling.yun.energy
carry.digital.nomad
使用其他個人檔案
```

This confirms that the Instagram Business Login flow can present an account selection surface instead of immediately reusing only the current browser account.

## Selected Profile

Selected:

```text
carry.digital.nomad
```

Reason:

- The profile name aligns with the current InboxPilot callback domain context.
- The run still stopped before any final OAuth authorization or callback.

Observed result:

```text
https://www.instagram.com/
```

Visible account:

```text
carry.digital.nomad
Carry凱睿｜IG x AI x 不露臉起號
```

## OAuth Consent And Callback Status

Final OAuth consent screen:

```text
Not shown
```

Callback status:

```text
Not captured
```

No redirect containing `code` was observed.

No request to the production callback was intentionally triggered by Codex after the profile selection result.

## Important Risk

Re-opening the same Instagram Business Login URL after selecting `carry.digital.nomad` may now skip profile selection and proceed directly to an OAuth consent or callback step.

Because the configured redirect URI points to:

```text
[REDACTED_PRODUCTION_CALLBACK_URL]
```

the next controlled run must avoid accidental production writes.

Before continuing to callback evidence, one of these controls should exist:

1. A sandbox-only redirect URI registered in Meta App Dashboard.
2. A temporary callback guard that records dry-run evidence without creating / updating production ConnectedAccount or Channel records.
3. A confirmed test workspace and explicit approval to allow a real callback into production-safe test data.

## Evidence Status

| Evidence | Status | Notes |
| --- | --- | --- |
| `force_reauth=true` behavior | Pass | Login screen shown despite authenticated browser context |
| Profile account selection | Pass | Two profiles plus "use another profile" shown |
| Selected test profile | Pass | `carry.digital.nomad` selected |
| OAuth consent screen | Hold | Not shown after selection |
| Authorization code | Not captured | No callback URL with `code` observed |
| Callback payload | Not captured | No callback evidence collected |
| Workspace linking | Hold | Not exercised |
| Channel sync | Hold | Not exercised |
| Redaction | Pass for captured evidence | No raw secrets / code / token recorded |
| Internal beta | Hold | Needs callback and workspace-linking evidence |
| Production implementation | No-Go | Needs App Review and production gates |

## Next Safe Step

Do not retry the same OAuth URL blindly.

Recommended next step:

```text
Create a sandbox-only callback capture path or register a sandbox redirect URI before completing OAuth consent.
```

If the production callback must be used for evidence, first confirm:

- Exact test workspace.
- Exact test Instagram profile.
- Expected ConnectedAccount / Channel behavior.
- Rollback steps.
- Redaction search commands after the callback.
