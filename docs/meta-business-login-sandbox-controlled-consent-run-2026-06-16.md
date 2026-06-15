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
Real authorization callback: Not captured
Reason: consent screen requires a user authorization action.
Codex action: stopped before clicking allow.
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
| Real callback evidence | Hold | Requires user to click allow. |
| Workspace linking | Hold | Not exercised. |
| Channel sync | Hold | Not exercised. |
| Internal beta | Hold | Callback and linking evidence missing. |
| Production implementation | No-Go | App Review and production gates missing. |

## Next Required Human Step

To capture real callback evidence, the user must click `allow` on the Instagram consent screen during a controlled run. Codex can then verify that the response is redacted JSON evidence and update the runbook / report / go-no-go checklist.
