# Codex Windows Setup

This guide keeps Windows setup reproducible without committing secrets. Use it when a second machine needs to run this project with Codex, project prompts, and optional AI features.

## 1. Clone and install

```powershell
git clone git@github.com:Forty-s-AI-Company/ig-auto-reply-manychat.git
cd ig-auto-reply-manychat
npm install
```

Use Node.js 20 or newer. The app currently runs Next.js 16 and React 19, so read `AGENTS.md` before code edits.

## 2. Environment files

Create a local env file from the safe template:

```powershell
Copy-Item .env.example .env.local
```

Fill `.env.local` from the real secret source. Do not commit `.env`, `.env.local`, database URLs with real passwords, OAuth client secrets, API keys, or service-role keys.

Minimum local values:

```text
DATABASE_URL=postgresql://postgres.<project-ref>:<db-password>@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require&connection_limit=1&pool_timeout=20
DIRECT_URL=postgresql://postgres.<project-ref>:<db-password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require
AUTH_SECRET=
APP_URL=http://localhost:3041
ADMIN_EMAIL=
ADMIN_PASSWORD=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Use the Supabase dashboard's Connect panel to copy the latest strings for the active project. Keep `DATABASE_URL` and `DIRECT_URL` from the same project, and do not reuse an old password after the project password changes.

After setting `ADMIN_EMAIL` and `ADMIN_PASSWORD`, create or update the admin user:

```powershell
npm run admin:ensure
```

## 3. Codex project context

The repo already tracks the project-level Codex context:

- `AGENTS.md`: mandatory agent rules, including the Next.js 16 documentation warning.
- `codex-prompt.md`: original project build prompt and product constraints.
- `docs/`: product, deployment, billing, API, and operational references.

Keep project prompts in tracked files when they are not secret. Keep account tokens, browser session data, local plugin caches, and private keys outside git.

## 4. Codex skills and plugins

Codex skills are local to each machine. They are not automatically restored from this repo.

On Windows, install or enable the same Codex plugins from the Codex app UI as needed:

- Browser / in-app browser
- Chrome, when logged-in web sessions are needed
- GitHub, for PRs and issue work
- Documents, Presentations, Spreadsheets, if document artifacts are needed

Personal skills should live under:

```text
%USERPROFILE%\.codex\skills
```

If a skill is stored in a separate private repo, clone or install it on Windows and keep any secrets in the Windows user environment or a local ignored env file.

## 5. Run the app

```powershell
npm run prisma:generate
npm run dev
```

Open:

```text
http://localhost:3041
```

For background jobs:

```powershell
npm run worker
```

## 6. Verify Codex-related behavior

```powershell
npm run lint
npm run test:unit
```

If login fails on a fresh Windows machine, check these first:

- `.env.local` points to the intended database.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set.
- `npm run admin:ensure` has been run against that database.
- `AUTH_SECRET` is set to a stable 32+ character value.

If Google login fails, confirm that the OAuth client has this redirect URI:

```text
http://localhost:3041/api/auth/google/callback
```

For production, use:

```text
https://your-domain.com/api/auth/google/callback
```

