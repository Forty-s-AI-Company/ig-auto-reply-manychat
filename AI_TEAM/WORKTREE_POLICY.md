# Worktree Policy

這份文件定義 AI_TEAM 的工作樹使用方式。核心原則很簡單：**branch 才是主體，worktree 只是暫時隔離手段**。

## 原則

1. 一個主題對應一個 branch。
2. worktree 只用來隔離當次任務，不當成長期資料夾。
3. 同一個主題不要同時開多個 worktree。
4. 新任務先檢查是否已有對應 branch 或 worktree，能接續就接續，不重複開。
5. PR 合併後，相關 worktree 應移除或明確標記已完成。
6. reports / logs / cache / `.env` / secret 永遠不進 PR。

## 建議流程

1. 先從 `origin/master` 建 branch。
2. 只有在需要避免污染主工作區時，才另外建立 temporary worktree。
3. 開發、測試、commit、push、PR 都在同一個主題 branch 完成。
4. PR merge 後，清理該主題的 temporary worktree。

## 什麼時候不要再開新 worktree

- 只是想繼續同一個功能主題。
- 已經有同主題 branch 在跑 CI 或等 PR。
- 只是想看差異，不需要獨立檔案系統。
- 目前工作樹已經夠多，會讓人分不清哪個才是主線。

## 判斷標準

- 看得到 branch 名稱，就知道這個 worktree 在做哪個主題。
- 看不到明確主題的 worktree，一律視為候補清理對象。
- 若 branch 已 merge，worktree 就不該再繼續留著假裝在用。
