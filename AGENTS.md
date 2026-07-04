# InboxPilot Agent Entry

InboxPilot 是一個 Instagram-first 的訊息營運 SaaS，使用 Next.js App Router、React、TypeScript、Prisma、PostgreSQL、Vercel、Meta / Instagram OAuth + Webhooks、PayUNI Sandbox billing，以及 Playwright / Vitest 做驗證。

## Canonical Source Of Truth

所有 AI agent 開始工作前只需要先讀這四份 active 文件：

1. `AGENTS.md`
2. `docs/AI_SOURCE_OF_TRUTH.md`
3. `docs/AI_RELEASE_CONTROL.md`
4. `docs/AI_TEAM_AUTOPILOT.md`

舊的 AI_TEAM 文件、handoff、runtime report、prompt、memory、task queue、舊 autopilot script 已封存到：

- `docs/archive/ai-legacy-2026-07-04/`
- `.ai-team/archive/automation-legacy-2026-07-04/`

封存內容只能當歷史參考，不可當 source of truth。

## Safety Rules

- 不輸出 secret、token、password、cookie、app secret、verify token、DB URL、PAYUNi key。
- 不碰 production DB。
- 不跑 production migration / `db push`。
- 不部署 Production，除非使用者明確切換到 production release task。
- 不送 Meta App Review，除非使用者明確說可以送審。
- PayUNI 預設只用 Sandbox。
- OAuth、Webhook、Payment、Subscription、Affiliate、Database schema、Security 變更必須先標明風險。
- 所有 Prisma query 與 API 必須考慮 workspace / tenant isolation。
- 不可自行宣布 production-ready；最多輸出 `BETA_READY_CANDIDATE`，最後由人類決定。

## Codex / Antigravity 分工

- Codex：讀碼、改碼、補測試、補文件、整理 git、產出 release decision。
- Antigravity / `agy`：Browser QA、RWD、console/network、visual / integration QA；只做 QA，不直接改 source。
- 本地模型：摘要、分類、低風險 review、報告草稿；不可主導高風險產品修改。

## Release Stabilization Mode

Local / staging 可以 aggressive 測試與修復，但必須守住 production guard。

唯一 autopilot 入口：

```bash
python scripts/ai_release_autopilot.py --mode status
python scripts/ai_release_autopilot.py --mode inventory
python scripts/ai_release_autopilot.py --mode docs-check
python scripts/ai_release_autopilot.py --mode run-once --profile local-aggressive
python scripts/ai_release_autopilot.py --mode run --profile local-aggressive --max-rounds 10
python scripts/ai_release_autopilot.py --mode run --profile staging-aggressive --max-rounds 10
```

## Core Validation

一般修改至少跑：

```bash
npm run lint
npm run build
npm test
```

依任務加跑：

```bash
npm run test:e2e
npm run test:e2e:reviewer
npm run payuni:smoke
```

如果無法執行，必須在報告中寫明原因，不可假裝通過。

## Required Output For Any Task

每次完成都要留下：

- diff summary
- validation evidence
- remaining risks
- human blockers
- whether state is `CONTINUE`, `BLOCKED`, or `BETA_READY_CANDIDATE`
