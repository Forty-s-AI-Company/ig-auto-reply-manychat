# Security Best Practices Skill

- Use this for OAuth, webhook, token, billing, admin, tenant, and callback
  changes.
- Review secrets handling, error redaction, workspace isolation, and write
  boundaries.
- Prefer user-readable errors that do not leak provider internals.
- Separate production-safe review from local convenience tooling.

## InboxPilot-specific risk areas

- Meta OAuth start and callback routes
- Instagram profile refresh and token refresh
- PayUNI checkout, return, and notify routes
- Admin payout and affiliate actions
- Workspace scope and account-channel selection
