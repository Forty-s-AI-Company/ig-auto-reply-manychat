# AI Team Model Assignment

本專案把 AI_TEAM 的本地模型編排拆成兩種模式：

- `一般模式`：平常工作時使用，優先速度與可接受品質
- `睡覺模式`：長時間無人值守時使用，優先品質、深度與長上下文

`Codex CLI` 跟 `Antigravity CLI` 不因模式切換而改變，只有本地 Ollama 模型會切換。

本專案使用 Codex Desktop / Codex CLI 作為總指揮。
Codex 負責高風險、架構、最終審查。
本地 Ollama 模型負責低風險、重複性、報告與 QA 支援。
Antigravity CLI 只在需要 browser / visual / E2E QA 時使用。

## Codex Desktop / Codex CLI

負責：

- Project Lead
- System Architect
- Backend Lead
- Security Lead
- Database / RLS Reviewer
- OAuth / Meta API Reviewer
- PayUNI / Billing Reviewer
- Final Reviewer

不要浪費 Codex 在：

- README 小修
- log 摘要
- 單純 report
- lint 小錯
- UI 文案

## qwen2.5-coder:7b

速度快，作為本地 coding 主力。

負責：

- Bug Fixer
- Static QA
- Build QA
- Frontend 小修
- TypeScript 小錯
- import / path alias 錯誤
- test helper

可自動改：

- 非高風險前端
- 型別小錯
- lint error
- 測試檔
- 報告

不可主導：

- OAuth
- PayUNI
- RLS
- webhook security
- production migration

## qwen2.5-coder:1.5b

超高速助理。

負責：

- log 摘要
- TODO 整理
- final report 初稿
- dev report 初稿
- 檔案變更摘要
- 錯誤分類

不可負責：

- 複雜 coding
- 後端安全
- 付款
- OAuth

## qwen3:8b

負責：

- Product Manager
- Prompt Engineer
- 需求拆解
- 下一輪 Codex prompt
- UX 流程檢查
- 優先順序整理

## llama3.1:8b

負責：

- README
- SETUP
- DEPLOYMENT
- CHANGELOG
- 使用者教學
- UI 文案
- 報告潤稿

## deepseek-coder-v2:lite

負責：

- Code Reviewer
- Bug Analyst
- Security Assistant
- Backend Reviewer
- Refactor Advisor

原則上只產報告，不直接改高風險檔案。

## qwen2.5-coder:14b

睡覺時使用。

負責：

- 後端小功能審查
- 型別架構檢查
- API helper
- 本地進階 code review

## qwen3-coder:30b

睡覺時使用。

負責：

- Deep Architecture Review
- Long Context Review
- 大型專案摘要
- 上線前深度檢查

## Antigravity CLI

只在需要 browser 時使用。

負責：

- Browser QA
- Visual QA
- RWD QA
- Flow QA
- OAuth browser flow check

不要用 Antigravity 做：

- 一般 lint
- 一般 build error
- README
- 大量 code review
- 後端安全主導

## 本地模型與權限原則

快模型做高頻工作。
慢模型做低頻深度工作。
Antigravity 只做需要瀏覽器的工作。
Codex 只做核心決策與高風險審查。

可以讓本地模型自動改或自動產報告：

- README / 文件 / 報告
- UI 文案 / Tailwind 小調整
- TypeScript 型別錯誤
- import / path alias 錯誤
- lint / build error
- 測試檔

本地模型只能提建議，不能直接主導高風險區域：

- Supabase RLS
- PayUNI callback
- Meta OAuth
- Webhook 驗證
- 會員權限
- 使用者資料隔離
- production migration

必須 Codex 複查：

- 付款
- OAuth
- token
- RLS
- migration
- webhook
- admin 權限
- 自動發送私訊邏輯

## 一般模式

用途：

- 白天開發
- 需要快一點的報告與整理
- 需要頻繁反覆執行 runner

本地模型預設分工：

| 職位 | 模型 | 工作 |
|---|---|---|
| Error Summarizer | qwen2.5-coder:1.5b | log 摘要、錯誤分類、TODO |
| Bug Fixer | qwen2.5-coder:7b | TypeScript、import、lint、build error、小型修補建議 |
| Code Reviewer | deepseek-coder-v2:lite | code review、bug 分析、安全輔助 |
| Prompt Engineer | qwen2.5-coder:7b | 下一輪 Codex prompt、需求拆解 |
| Final Report Writer | qwen2.5-coder:1.5b | final report 初稿 |

## 睡覺模式

用途：

- 長時間 unattended loop
- 睡前掛著跑
- 需要比較深的 review 與比較完整的建議

本地模型預設分工：

| 職位 | 模型 | 工作 |
|---|---|---|
| Error Summarizer | qwen2.5-coder:7b | 較完整的 QA / build / 測試摘要 |
| Bug Fixer | qwen2.5-coder:14b | 進階修補建議、較長上下文的程式審查 |
| Code Reviewer | qwen3-coder:30b | Deep architecture / stability / risk review |
| Prompt Engineer | qwen3:8b | 下一輪 Codex prompt、優先順序整理 |
| Final Report Writer | qwen2.5-coder:7b | 比較完整的 final report |

## Codex CLI / Antigravity CLI

這兩個不分模式，固定角色如下：

| 角色 | 工具 | 工作 |
|---|---|---|
| Project Lead / Architect / High-risk Reviewer | Codex CLI | 任務規劃、實作、架構、高風險複查 |
| Browser QA | Antigravity CLI | Browser QA、RWD、流程、OAuth 視窗、E2E 體感驗證 |

## 平常使用 AI 團隊

| 職位 | 模型 / 工具 | 工作 |
|---|---|---|
| Project Lead | Codex CLI | 任務規劃、決定優先順序、控制修改範圍 |
| System Architect | Codex CLI | 架構、資料流、高風險技術決策 |
| Backend Lead | Codex CLI | API、Webhook、權限、付款、RLS |
| Frontend Worker | qwen2.5-coder:7b | Dashboard、表單、Modal、Tailwind 小修 |
| Bug Fixer | qwen2.5-coder:7b | TypeScript、import、lint、build error |
| Error Summarizer | qwen2.5-coder:1.5b | log 摘要、錯誤分類、TODO |
| Prompt Engineer | qwen3:8b | 下一輪 Codex prompt、需求拆解 |
| Documentation Writer | llama3.1:8b | README、SETUP、CHANGELOG、文案 |
| Code Reviewer | deepseek-coder-v2:lite | code review、bug 分析、安全輔助 |
| Browser QA | Antigravity CLI | 看畫面、RWD、按鈕、流程、OAuth 視窗 |

## 睡覺無人值守 AI 團隊

| 順序 | 職位 | 模型 / 工具 | 產出 |
|---:|---|---|---|
| 1 | Test Runner | PowerShell / Node | `AI_TEAM/runtime/qa-report.md` |
 | 2 | Error Summarizer | qwen2.5-coder:7b | `AI_TEAM/runtime/error-summary.md` |
 | 3 | Bug Fixer | qwen2.5-coder:14b | `AI_TEAM/runtime/static-qa.md` |
 | 4 | Code Reviewer | qwen3-coder:30b | `AI_TEAM/runtime/code-review.md` |
 | 5 | Prompt Engineer | qwen3:8b | `AI_TEAM/runtime/next-codex-prompt.md` |
 | 6 | Final Report Writer | qwen2.5-coder:7b | `AI_TEAM/runtime/final-report.md` |
| 7 | Browser QA | Antigravity CLI | `AI_TEAM/runtime/browser-qa.md` |

## 目前 AI_TEAM 最小可用實作

- `npm run ai-team:qa`
  - 跑 `ai-team:check`
  - 跑 `npm run lint`
  - 在非 production `TEST_DATABASE_URL` 可用時跑 `npm test`
  - 跑 `npm run build`
  - 呼叫 `agy` 產出 Browser QA 報告
- `npm run ai-team:models:general`
  - 用一般模式的快模型產出 error summary / static QA / code review / final report / next prompt
- `npm run ai-team:models:sleep`
  - 用睡覺模式的深度模型產出 error summary / static QA / code review / final report / next prompt
- `npm run ai-team:loop:general`
  - 依序執行 `ai-team:qa` 與一般模式本地模型
- `npm run ai-team:loop:sleep`
  - 依序執行 `ai-team:qa` 與睡覺模式本地模型
  - 把 health summary 與 runner log 寫到 `AI_TEAM/runtime/`

## 注意

- `AI_TEAM/runtime/` 是執行期輸出，**不提交 git**。
- 真正的產品程式碼修改、commit、push、PR、merge，仍然由 Codex / 人工審查控制。
