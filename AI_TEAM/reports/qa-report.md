# QA Report

## QA 模式

- QA_MODE=AI_TEAM_LOCAL_QA

## 驗證範圍

- AI_TEAM 入口腳本
- lint / test / build gate
- 非 production 測試資料庫 preflight

## 結果

- `ai-team:check`：PASS，AI_TEAM 骨架完整。
- `npm run lint`：PASS，通過。
- `test-db-guard`：WARN，未設定 TEST_DATABASE_URL，跳過需要資料庫的測試。
- `npm run build`：PASS，通過。

## 阻塞

- `test-db-guard`：未設定 TEST_DATABASE_URL，跳過需要資料庫的測試。

## 診斷

- **Supabase CLI**：`supabase status` 失敗。timeout after 12000ms 建議先檢查 Docker Desktop / Supabase local stack。
- **Docker**：`docker ps` 失敗。timeout after 12000ms 建議先確認 Docker Desktop engine 是否正常。
