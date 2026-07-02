# Meta Business Login Final Permission Usage Proof Matrix

Date: 2026-06-16
Status: Draft proof matrix / App Review readiness Hold / internal beta Hold / production implementation No-Go

## Scope

This matrix reconciles the currently requested and candidate Meta / Instagram permissions for the Meta Business Login sandbox App Review package.

This document does not change:

- OAuth flow
- callback route
- login button
- environment variables
- Prisma schema
- production ConnectedAccount / Channel writes
- real Meta token exchange

Source documents:

```text
docs/meta-business-login-final-app-review-demo-package-checklist.md
docs/meta-business-login-app-review-demo-script.md
docs/meta-login-account-selection-analysis.md
docs/meta-business-login-sandbox-authenticated-browser-evidence-run-2026-06-15.md
docs/meta-business-login-sandbox-controlled-consent-run-2026-06-16.md
docs/meta-business-login-sandbox-sbl13-workspace-linking-sync-dry-run.md
```

## Current Permission Sources

Observed current and candidate sources:

| Source | Permission / scope set | Status |
| --- | --- | --- |
| Current `meta-instagram` provider | `instagram_business_basic`, `instagram_business_manage_comments`, `instagram_business_manage_messages` | Current product scope set |
| Current `meta-facebook` provider | `public_profile`, `pages_show_list`, `pages_read_engagement`, `pages_manage_metadata`, `pages_messaging`, `instagram_basic`, `instagram_manage_comments`, `instagram_manage_messages`, `business_management` | Current Facebook / Page-linked candidate set |
| Legacy Meta OAuth start route | Instagram path uses `instagram_business_*`; Facebook path uses Pages / Instagram Graph / Business scopes | Current legacy path |
| Meta-provided Instagram Business Login URL observed in sandbox evidence | `instagram_business_basic`, `instagram_business_manage_messages`, `instagram_business_manage_comments`, `instagram_business_content_publish`, `instagram_business_manage_insights` | Candidate / Dashboard-generated URL, not yet approved as final scope set |

## Evidence Status Legend

| Status | Meaning |
| --- | --- |
| Pass | Evidence exists and is suitable for internal review. |
| Partial Pass | Some sandbox or dry-run evidence exists, but final reviewer proof is incomplete. |
| Hold | Permission may be legitimate, but App Review proof is not complete. |
| Defer / Remove | Scope should not be requested until a product use case and reviewer proof exist. |

## Permission Usage Proof Matrix

| Permission / scope | Flow | Product screen | User action | Data read | Data written | Data stored | Retention / deletion | Reviewer demo proof | Evidence status | Recommendation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `instagram_business_basic` | Instagram Business Login | Channels / Social Accounts, Channel detail, profile refresh | User connects an Instagram professional account and views the connected channel. | IG user id, username, display name, account type, profile metadata. | Sandbox only: workspace / channel draft with `wouldCreate=false`. Future production: channel profile metadata after approval. | Future production would store provider account id, username, display name, account type, workspace / channel mapping. Sandbox run stores no token. | Retain while channel remains connected; delete on disconnect or workspace data deletion request. | Account selection, consent, redacted callback, and channel dry-run evidence exist; final reviewer recording still missing. | Partial Pass | Keep. Add final reviewer recording and masked IG profile proof before App Review. |
| `instagram_business_manage_messages` | Instagram Business Login | Inbox, conversation detail, automation reply builder | User receives or replies to IG direct messages and configures automation replies. | IG message events, conversation metadata, sender-scoped identifiers. | Future production may send replies through approved messaging APIs. Sandbox writes nothing. | Future production would store workspace-scoped messages, conversation references, automation execution records, and safe message metadata. | Retain according to workspace message retention and delete on disconnect / data deletion request; never store tokens in logs or docs. | Dry-run channel sync lists messaging capability checks, but no reviewer-facing live message demo exists yet. | Hold | Keep if messaging remains core. Add reviewer demo with test IG message, Inbox proof, automation proof, and redacted logs. |
| `instagram_business_manage_comments` | Instagram Business Login | Comment sync, automation comment trigger, channel activity | User syncs comments or configures comment-triggered automation. | IG comments, media/comment identifiers, commenter-scoped identifiers. | Future production may reply to or process comments when automation requires it. Sandbox writes nothing. | Future production would store workspace-scoped comment events, automation trigger records, and safe comment metadata. | Retain according to workspace activity retention and delete on disconnect / data deletion request. | Dry-run channel sync lists comment capability checks, but no reviewer-facing comment sync demo exists yet. | Hold | Keep if comment automation remains in launch scope. Add test post / comment demo proof before App Review. |
| `instagram_business_content_publish` | Instagram Business Login candidate | No confirmed current InboxPilot screen | User would create or publish IG content from InboxPilot. | Publishing target account and media publishing status, if implemented. | Would publish media/content to Instagram, if implemented. | Would store publish job metadata and status, if implemented. | Not applicable until product feature exists; any future records need deletion policy. | No current reviewer proof. Observed only in Meta-generated candidate URL. | Defer / Remove | Remove from final App Review scope unless a real publishing feature, UI, tests, and reviewer demo are added. |
| `instagram_business_manage_insights` | Instagram Business Login candidate | Analytics / channel insights, if implemented | User would view IG account or media insights. | IG account/media insights and metrics. | No expected write. | Would store aggregated analytics snapshots or cached metrics, if implemented. | Retain only aggregate analytics required by product; delete on disconnect / data deletion request. | No current reviewer proof. Observed only in Meta-generated candidate URL and ManyChat comparison. | Defer / Remove | Defer unless analytics becomes a reviewed feature. Do not request for internal beta unless proof is added. |
| `public_profile` | Facebook Login / Facebook Login for Business | Social Accounts, connected account list | User authorizes Facebook identity for Page / Business asset access. | Facebook user id, name, profile picture. | Connected account identity mapping after approved production flow. Sandbox writes nothing. | Future production would store provider user id and display metadata only. | Retain while Facebook connected account remains linked; delete on disconnect / data deletion request. | Existing demo script describes proof, but final Business Login reviewer recording is missing. | Hold | Keep only if Facebook Login for Business remains in selected flow. Not needed for Instagram Business Login-only path. |
| `pages_show_list` | Facebook Login / Facebook Login for Business | Business / Page / IG selection, Channel creation | User selects a Facebook Page linked to an IG professional account. | Page list, Page id/name, linked IG asset reference. | Future production may create workspace-scoped selected Page mapping. Sandbox writes nothing. | Future production would store masked / internal references to selected Page and linked IG account. | Retain while channel remains connected; delete on disconnect / data deletion request. | Business / Page / IG asset proof is still missing from final package. | Hold | Keep for Facebook Login for Business / Page-linked IG flow. Add masked Page selection proof before App Review. |
| `pages_read_engagement` | Facebook Login / Facebook Login for Business | Channel detail, Page/IG sync, comment sync support | User reviews Page-linked IG channel status or syncs engagement-related data. | Page engagement metadata and Page-linked IG metadata needed for sync. | No direct write expected. | Future production may store Page-linked channel metadata and sync status. | Retain while linked channel exists; delete on disconnect / data deletion request. | No final reviewer proof yet. | Hold | Keep only if required by the Facebook Graph Page-linked flow. Add specific screen proof or remove from final request. |
| `pages_manage_metadata` | Facebook Login / Facebook Login for Business | Channel connection, webhook setup / verification status | User connects a Page-backed IG channel and enables event delivery. | Page metadata and webhook subscription capability. | Future production may subscribe / manage Page webhook metadata after approval. Sandbox writes nothing. | Future production may store webhook subscription status and channel sync status. | Retain webhook status while channel connected; delete subscription on disconnect / rollback. | No final reviewer proof yet. | Hold | Keep only if production flow must manage Page webhook subscriptions. Add webhook setup proof and rollback proof. |
| `pages_messaging` | Facebook Login / Facebook Login for Business | Inbox, automation reply, Page / Messenger messaging support | User receives or replies to Page/Messenger-related messages, or Page-backed messaging flow needs it. | Messaging events, conversation metadata, sender-scoped identifiers. | Future production may send replies through approved messaging APIs. Sandbox writes nothing. | Future production would store workspace-scoped conversations and messages. | Retain according to message retention; delete on disconnect / data deletion request. | No final reviewer-facing messaging proof yet. | Hold | Keep only if Page/Messenger messaging is part of the selected App Review package. Prefer Instagram Business messaging scope for IG-only path. |
| `instagram_basic` | Instagram Graph API with Facebook Login | Channel detail, profile refresh for Page-linked IG account | User connects a Page-linked Instagram account through Facebook authorization. | IG basic profile fields through the linked Page / IG Graph path. | Future production may create IG channel profile metadata. Sandbox writes nothing. | Future production would store IG provider account id and profile metadata. | Retain while channel connected; delete on disconnect / data deletion request. | No final Facebook Graph reviewer proof yet. | Hold | Keep only for Facebook Login / Page-linked IG flow. Not needed for Instagram Business Login-only scope set. |
| `instagram_manage_comments` | Instagram Graph API with Facebook Login | Comment sync, automation comment trigger | User syncs comments or configures comment-triggered automation through Page-linked IG flow. | IG comments and comment metadata through Graph API. | Future production may reply to / process comments through approved APIs. Sandbox writes nothing. | Future production would store workspace-scoped comment events and automation records. | Retain according to activity retention; delete on disconnect / data deletion request. | No final Facebook Graph comment demo proof yet. | Hold | Keep only if the Facebook Graph flow remains active. Add test post / comment proof before App Review. |
| `instagram_manage_messages` | Instagram Graph API with Facebook Login | Inbox, automation reply for Page-linked IG messages | User receives or replies to IG messages through Page-linked Graph flow. | IG message events and conversation metadata. | Future production may send message replies through approved APIs. Sandbox writes nothing. | Future production would store workspace-scoped conversation/message records. | Retain according to message retention; delete on disconnect / data deletion request. | No final Facebook Graph message demo proof yet. | Hold | Keep only if Facebook Login for Business path is selected. Add reviewer message demo proof. |
| `business_management` | Facebook Login for Business | Business / Page / IG asset selection | User selects Business assets and confirms the Page / IG asset to connect. | Business asset relationships, available Page and IG account relationships. | Future production may store selected Business / Page / IG mapping. Sandbox writes nothing. | Future production would store workspace-scoped selected asset references and sync status, with ids masked in logs/docs. | Retain while connected; delete mapping on disconnect / data deletion request. | Account selection UX exists for Instagram profiles, but final Business / Page / IG asset proof is not complete. | Hold | Keep only if Facebook Login for Business is the chosen path. Add masked Business/Page/IG asset proof. |
| `openid` | External reference only / not currently requested by InboxPilot | Not applicable | Not applicable unless an OIDC-based Meta design is approved. | Identity claims if implemented. | No current write. | No current storage. | Not applicable. | Observed as an external comparison pattern only, not an InboxPilot request. | Defer / Remove | Do not request unless a separate OIDC ADR approves it. |

## Recommended Scope Set Before App Review

### Instagram Business Login-only candidate

Use the smallest scope set that matches current InboxPilot IG channel value:

```text
instagram_business_basic
instagram_business_manage_messages
instagram_business_manage_comments
```

Hold or remove from the final request until there is product proof:

```text
instagram_business_content_publish
instagram_business_manage_insights
```

Rationale:

- `instagram_business_basic` is needed to identify the connected professional IG account.
- `instagram_business_manage_messages` maps to Inbox and automation reply use cases.
- `instagram_business_manage_comments` maps to comment sync and comment-triggered automations.
- Content publishing and insights do not yet have enough product-screen and reviewer-demo evidence.

### Facebook Login for Business candidate

If the selected beta path requires Business / Page / IG asset selection through Facebook Login for Business, reconcile and prove only the scopes used by that path:

```text
public_profile
pages_show_list
pages_read_engagement
pages_manage_metadata
pages_messaging
instagram_basic
instagram_manage_comments
instagram_manage_messages
business_management
```

This path must not be treated as approved only because Instagram Business Login profile selection worked. It needs its own Business / Page / IG asset evidence, callback proof, permission proof, and reviewer recording.

## Reviewer Demo Proof Requirements

The final reviewer recording must prove each kept permission with visible product behavior:

| Proof item | Required evidence | Current status |
| --- | --- | --- |
| Account selection | Account/profile selection or use-another-profile path appears. | Pass evidence exists |
| Consent screen | App name and requested permissions are visible without exposing secrets. | Pass evidence exists |
| Profile identity | Connected IG username / account type is shown in InboxPilot. | Hold |
| Messaging | Test IG message appears in Inbox or automation flow. | Hold |
| Comments | Test IG comment appears in comment sync / automation flow. | Hold |
| Business / Page / IG asset selection | Reviewer can see masked Business / Page / IG selection and mapping. | Hold |
| Redacted callback | Callback evidence uses redacted JSON only. | Pass evidence exists |
| Workspace linking | Workspace/channel draft maps to the selected account without production writes. | Pass dry-run |
| Channel sync | Channel sync dry-run payload contains no token, code, secret, raw state, or full callback URL. | Pass dry-run |
| Redaction search | Final docs/tests/logs/screenshots are searched immediately before review. | Hold |

## Retention And Deletion Baseline

For every permission kept in the final App Review request:

- Store only workspace-scoped account, channel, conversation, comment, automation, and sync metadata required for the product use case.
- Do not store raw authorization code, raw state, raw nonce, full callback URL, access token, refresh token, app secret, client secret, or webhook verify token in docs, logs, audit records, screenshots, recordings, or browser-visible payloads.
- Store tokens only in an approved encrypted production token store after a separate production implementation ADR and App Review approval.
- Delete connected account mappings, channel mappings, message/comment data, cached analytics, and webhook subscriptions on disconnect or data deletion request according to the product data deletion policy.
- Keep sandbox evidence redacted and hash-only.

## Current Decision

```text
Permission usage proof matrix: Draft complete
Instagram Business Login minimum scope recommendation: Keep three core IG business scopes
Content publish / insights: Defer or remove until product proof exists
Facebook Login for Business scope set: Hold until selected flow and asset proof are reconciled
App Review readiness: Hold
Internal beta: Hold
Production implementation: No-Go
```

Main blocker:

The permission matrix is now documented, but final App Review proof still requires reviewer-facing recording, current Meta Dashboard scope reconciliation, Business / Page / IG test asset proof, live product-screen evidence for each kept scope, redaction search, rollback proof, and product owner sign-off.
