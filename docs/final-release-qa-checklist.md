# InboxPilot final release QA checklist

Date: 2026-07-02
Scope: local / staging / preview-safe QA only. Production DB, production deploy, Meta App Review, and PayUNI production switch are out of scope.

## Release gates

| Gate | Required result | Status |
| --- | --- | --- |
| Build | `npm run build` succeeds | Passed |
| Lint | `npm run lint` succeeds | Passed |
| Unit / integration | `npm test` succeeds | Passed |
| Auth smoke | Login, auth guard, dashboard route render | Passed after local E2E admin fixture refresh |
| UI destructive actions | No native browser confirm/alert for user-facing destructive controls | Covered by focused tests |
| Production health | `/api/health` read-only check only | Manual / post-merge |
| Staging health | `/api/health/staging` read-only check only | Manual / post-merge |
| Payments | PayUNI Sandbox only | Manual sandbox smoke |
| Meta | OAuth UX only, no App Review submission | Manual reviewer-safe smoke |

## Page matrix

| Area | Routes | Roles | QA focus |
| --- | --- | --- | --- |
| Public site | `/`, `/official`, `/pricing`, `/about`, `/contact` | Visitor | Copy clarity, CTA routing, responsive layout, legal links |
| Auth | `/login`, `/signup`, `/oauth/popup/callback` | Visitor / user | Error copy, cookie/session behavior, redirect target |
| Dashboard | `/dashboard` | Authenticated workspace user | IG scope card, empty-state CTA, plan/profile menu clarity |
| Inbox | `/inbox` | Authenticated workspace user | Channel scope, search/filter, conversation selection, composer feedback |
| Contacts | `/contacts`, `/contacts/[id]` | Authenticated workspace user | Tag creation, filter, bulk actions, detail edit, empty state |
| Channels | `/channels`, `/channels/connect`, `/channels/connect/social` | Authenticated workspace user | IG connection, profile refresh error redaction, destructive disconnect dialog |
| Automations | `/automations`, `/automations/instagram-default-reply`, `/sequences` | Authenticated workspace user | Disabled UX, sequence deletion dialog, save validation |
| Analytics | `/analytics` | Authenticated workspace user | Scoped metrics, Recharts 7-day message chart, empty-state guidance |
| Billing / wallet | `/billing`, `/wallet` | Authenticated workspace user | Sandbox status, referral credit copy, no production payment switch |
| Referrals | `/referrals`, `/affiliate` | Authenticated workspace user | Non-cash credit positioning, no misleading payout CTA |
| Admin | `/admin/invoices`, `/admin/affiliates`, `/admin/payouts`, `/admin/audit` | Admin / operator | Tenant safe reads, controlled refund dialog, no raw payment enum leakage |
| Settings-like tools | `/ai-settings`, `/api-docs`, `/knowledge-base`, `/tags` | Authenticated workspace user | Clear gating, CRUD delete dialog, no fake actions |

## API / integration matrix

| Area | Representative routes | QA focus |
| --- | --- | --- |
| Auth | `/api/auth/login`, `/api/auth/logout`, `/api/auth/me` | Auth guard, cookie scope, generic error copy |
| Workspace scope | `/api/account-scope`, `/api/workspace/*` | Selected Instagram channel must not leak cross-workspace data |
| Conversations | `/api/conversations`, `/api/conversations/[id]`, `/api/conversations/[id]/messages` | Scope, reply feedback, unsupported send reason |
| Contacts / tags | `/api/contacts`, `/api/contacts/[id]`, `/api/tags`, `/api/segments` | Tenant isolation, validation, bulk operations |
| Channels / Meta | `/api/channels/*`, `/api/meta/oauth/*`, `/api/meta/webhook` | Token safety, redacted provider errors, App Review-aware copy |
| Billing / PayUNI | `/api/billing/*`, `/api/payuni/*`, `/api/admin/invoices/*` | Sandbox mode, signature/idempotency, refund credit clawback UX |
| Automations | `/api/automations/*`, `/api/sequences/*`, `/api/webhooks/instagram` | Worker safety, trigger clarity, destructive dialog |
| Admin | `/api/admin/*` | Admin guard, tenant safe reads, no secret/raw enum output |
| Health | `/api/health`, `/api/health/staging` | Read-only status, no schema mutation |

## Role matrix

| Role | Must be able to | Must not be able to |
| --- | --- | --- |
| Visitor | Read landing/pricing/legal, sign up/login | Access dashboard/admin APIs |
| Workspace user | Manage own IG channels, inbox, contacts, automations, billing view | Read another workspace data |
| Workspace owner/admin | Access operator tools exposed in profile/settings | Trigger production payment or DB mutation from QA |
| Internal operator | Review admin invoice/referral states | See secrets, raw tokens, or unmanaged payout actions |

## Manual QA viewport matrix

| Viewport | Target routes |
| --- | --- |
| Mobile 390x844 | Dashboard, Inbox, Contacts, Channels, Analytics |
| Tablet 768x1024 | Inbox split panes, Contacts table, Billing/referrals |
| Desktop 1440x900 | Full navigation, profile menu, admin pages |
