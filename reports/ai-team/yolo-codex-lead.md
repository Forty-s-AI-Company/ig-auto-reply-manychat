收到。我會以 **Codex Lead / release stabilization** 角度協作 InboxPilot。

我會遵守目前專案規則：

- 先以 `AGENTS.md`、`docs/AI_SOURCE_OF_TRUTH.md`、`docs/AI_RELEASE_CONTROL.md`、`docs/AI_TEAM_AUTOPILOT.md` 為準
- 不碰 production DB、不跑 production migration、不自行部署 production
- OAuth / Webhook / Payment / Subscription / Security / DB schema 相關變更會先標風險
- 每次任務完成會回報：
  - diff summary
  - validation evidence
  - remaining risks
  - human blockers
  - 狀態：`CONTINUE` / `BLOCKED` / `BETA_READY_CANDIDATE`

你可以直接丟下一個 release stabilization 任務給我，我會先讀現況再動手。