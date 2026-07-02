# UI UX Pro Max Skill

- Use this before changing product behavior in Inbox, Channels, Contacts,
  Automations, Analytics, Billing, or Referrals.
- Decide whether a control should become:
  - minimum usable
  - clearly disabled
  - hidden in simple release
- Prefer removing ambiguity over preserving every visible option.
- If a feature is unsafe or incomplete, do not leave a clickable dead end.
- Always define the target user action, failure state, and release-mode behavior
  before editing UI.

## InboxPilot-specific rules

- `simple` release must not feel broken; gated features need explicit UX.
- Instagram and workspace scope must be visible where it affects data.
- Billing, OAuth, and automation controls should never imply completion if the
  required backend path is absent.
