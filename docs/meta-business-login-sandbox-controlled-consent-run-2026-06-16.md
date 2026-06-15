# Meta Business Login Sandbox Controlled Consent Run - 2026-06-16

## Scope

This run validated the sandbox callback capture guard after production deployment and then continued the Instagram Business Login browser flow only until the authorization consent screen.

No authorization approval was clicked by Codex.

## Deployment Probe

Production callback probe result:

```text
Status: Pass
Response type: redacted JSON evidence
Raw fake code present: No
Raw sandbox state marker present: No
Invalid-state redirect: No
Token exchange attempted: No
Production writes: No
```

This confirms the production callback route is running the signed-state sandbox callback capture guard.

## Browser Flow

OAuth transport:

```text
Instagram Business Login authorize URL
Redirect URI: [REDACTED_PRODUCTION_CALLBACK_URL]
State: [REDACTED_SANDBOX_CAPTURE_STATE]
Authorization code: not issued
```

Observed with `force_reauth=true`:

```text
Instagram login/profile selection was shown.
Profiles shown:
- carry.digital.nomad
- ling.yun.energy
- use another profile
```

After selecting `carry.digital.nomad`, Instagram returned to the Instagram home page instead of continuing to callback.

Observed without `force_reauth=true` after the profile session existed:

```text
Instagram consent screen was shown.
App name: manychat-auto-reply-IG
Buttons shown: allow / cancel
Privacy policy link: present
Terms of service link: present
```

## Callback Status

```text
Real authorization callback: Captured
User action: user clicked allow on the Instagram consent screen.
Codex action: verified only the redacted callback response body.
```

## Redacted Callback Evidence Result

```text
Status: success
Mode: sandbox_callback_capture
Provider id: meta-business-instagram-sandbox
Code: [REDACTED_CODE]
State: [REDACTED_STATE]
Callback URL: [REDACTED_CALLBACK_URL]
Code hash: present
State hash: present
Error type: null
Exchange attempted: false
Production writes:
  connectedAccount: false
  channel: false
  webhook: false
  channelSync: false
  tokenRefresh: false
Raw leak detected in response body: false
```

## Security Notes

- No raw authorization code was recorded.
- No raw state was recorded in this document.
- No full callback URL was recorded in this document.
- No token or secret was recorded.
- No ConnectedAccount / Channel / webhook / channel sync write was performed by the sandbox capture path.

## Gate Result

| Gate | Status | Notes |
| --- | --- | --- |
| Production callback guard deployment | Pass | Redacted JSON probe succeeded. |
| Account selection UX | Pass | Multiple profiles plus use-another-profile shown. |
| Consent screen reachability | Pass | Consent screen shown without `force_reauth=true`. |
| Real callback evidence | Pass | User clicked allow; callback body returned redacted sandbox evidence. |
| Workspace linking | Hold | Not exercised. |
| Channel sync | Hold | Not exercised. |
| Internal beta | Hold | Workspace linking and channel sync evidence missing. |
| Production implementation | No-Go | App Review and production gates missing. |

## Next Required Sandbox Step

Workspace linking and channel sync still need dry-run evidence before internal beta. Do not proceed to production implementation.
