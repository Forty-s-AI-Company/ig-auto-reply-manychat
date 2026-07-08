# Meta App Review Package

這份文件整理目前可供 Meta reviewer 使用的測試資訊與證據邊界。此文件是 reviewer package 的簡化 canonical 版本，不含 secret、token、cookie、密碼或其他敏感值。

## Product and Legal Identity

- Product brand: `InboxPilot`
- Legal subject: `Luo Shih Lin`
- 中文姓名：`羅仕林`
- Contact email: `zeroyuanbrothers@gmail.com`
- Website: `https://inboxpilot.carry-digital-nomad.in.net/`
- Statement:
  - `InboxPilot is a software product operated by Luo Shih Lin.`
  - `InboxPilot 為羅仕林個人開發與營運之自動化行銷工具。`

## Current Release / Review Status

- Current release state: `HUMAN_BLOCKED`
- Business Verification: `BLOCKED_NO_FORMAL_DOCS`
- Current strategy: prepare App Review package first; do not submit mismatched business documents.

## Reviewer Environment

- Staging URL: [https://staging.carry-digital-nomad.in.net](https://staging.carry-digital-nomad.in.net)
- Public website URL: [https://inboxpilot.carry-digital-nomad.in.net/](https://inboxpilot.carry-digital-nomad.in.net/)
- Privacy Policy URL: [https://inboxpilot.carry-digital-nomad.in.net/privacy-policy](https://inboxpilot.carry-digital-nomad.in.net/privacy-policy)
- Terms URL: [https://inboxpilot.carry-digital-nomad.in.net/terms-of-service](https://inboxpilot.carry-digital-nomad.in.net/terms-of-service)
- Data Deletion URL: [https://inboxpilot.carry-digital-nomad.in.net/data-deletion](https://inboxpilot.carry-digital-nomad.in.net/data-deletion)

## Test Account

- Reviewer-safe staging login: available through secure handoff only
- Do not place test credentials in git or public review notes
- If Meta reviewer credentials are needed, they should be delivered through a secure manual handoff path

## Demo Flow

1. Sign in to staging with reviewer-safe account
2. Open Dashboard
3. Open Channels / Connect Instagram
4. Run Instagram OAuth connect flow
5. Verify connected channel appears in Channels and sidebar
6. Open Inbox and view reviewer-safe conversation
7. Open Contacts and view reviewer-safe contact
8. Open Automations and view reviewer-safe draft / rule
9. Open Privacy Policy, Terms, and Data Deletion pages

## Required Permissions

- `instagram_business_basic`
  - Used to identify the connected Instagram professional account and basic account context
- `instagram_business_manage_comments`
  - Used to read comment events and support comment-triggered automation flows
- `instagram_business_manage_messages`
  - Used to read and reply to Instagram messages after the workspace owner grants authorization

## Permission Usage Explanation

- InboxPilot only uses the granted permissions to support connected-channel sync, inbox visibility, reply workflows, contact context, and automation triggers.
- InboxPilot does not claim access beyond the user-authorized workflow.
- If permissions are missing or still review-gated, related surfaces should remain disabled or clearly explained.

## Screenshots Checklist

- Staging login
- Dashboard
- Channels / Connect entry
- OAuth consent
- Connected channel in Channels
- Connected channel in sidebar
- Inbox reviewer-safe conversation
- Contacts reviewer-safe contact
- Automations reviewer-safe rule
- Privacy Policy
- Terms
- Data Deletion

## Demo Video Checklist

- Login to staging
- Dashboard overview
- Instagram connect entry
- OAuth / consent flow
- Connected channel success state
- Inbox, Contacts, and Automations evidence
- Privacy / Terms / Data Deletion pages

## Human Blockers

- Business Verification is not ready without formal registration documents
- Advanced Access still depends on Meta-side human approval
- Final App Review submission still requires manual owner authorization

## Submission Guidance

- App Review package can be prepared incrementally
- Do not submit Business Verification with mismatched or fabricated business documents
- Keep the product brand as `InboxPilot`, but keep the legal subject explicitly mapped to `Luo Shih Lin`
