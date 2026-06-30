# AI_TEAM Model Assignment

AI_TEAM 現在分成兩層：

1. `Codex CLI` 是主開發引擎，負責真正讀碼、改碼、驗證、更新文件。
2. 本地模型是輔助層，負責摘要、報告、下一輪提示詞、低風險小修建議。

這樣做的原因很直接：

- 真正會改產品程式的主體要單一，避免多個代理同時亂改。
- 本地模型便宜、快，適合做整理與分流，不適合主導高風險產品修改。
- Browser QA 由 Playwright 為主，`agy` / Antigravity CLI 為 fallback，不讓 QA 流程卡死在單一工具。

## 角色總表

| 層級 | 工具 / 模型 | 主要工作 | 是否直接改產品碼 |
|---|---|---|---|
| 主開發 | Codex CLI | 讀碼、實作、修 bug、補測試、更新文件、收斂 commit-ready 變更 | 是 |
| Browser QA | Playwright | UI / 互動 / 路徑 / console / network smoke | 否 |
| Browser QA fallback | Antigravity CLI (`agy`) | 補充 prompt-driven browser QA | 否 |
| Error Summarizer | qwen2.5-coder:1.5b / 7b | log 摘要、錯誤分類、阻塞整理 | 否 |
| Bug Fix Advisor | qwen2.5-coder:7b / 14b | 低風險修補建議、靜態檢查摘要 | 否 |
| Code Reviewer | deepseek-coder-v2:lite / qwen3-coder:30b | review、風險提示、穩定性觀察 | 否 |
| Prompt Engineer | qwen3:8b | 下一輪 Codex prompt、任務拆解 | 否 |
| Report Writer | llama3.1:8b / qwen2.5-coder:1.5b | README / 報告 / 操作說明初稿 | 否 |

## Codex CLI

Codex CLI 是 AI_TEAM 的核心。

負責：

- 產品功能實作
- API / UI / 測試修改
- 高風險邏輯複查
- 驗證與文件同步
- 把每輪工作收斂到可提交狀態

Codex CLI 優先處理：

- Inbox / Contacts / Channels / Automations / Analytics 的產品功能完整性
- visible-but-unusable 控制項
- disabled UX 補強
- focused tests / Playwright smoke
- 會影響上線的真實缺口

Codex CLI 不應該浪費在：

- 純 log 摘要
- 重複型報告整理
- 下一輪 prompt 草稿
- 沒有上下文風險的文案潤稿

## 本地模型

本地模型不是主開發者。
它們的責任是幫 Codex CLI 節省時間，不是取代 Codex CLI。

### 一般模式

用途：

- 白天工作
- 追求速度
- 快速迭代
- 小功能連續修補

| 職位 | 模型 | 工作 |
|---|---|---|
| Error Summarizer | qwen2.5-coder:1.5b | 快速整理錯誤與 TODO |
| Bug Fix Advisor | qwen2.5-coder:7b | lint / type / import / 小修建議 |
| Code Reviewer | deepseek-coder-v2:lite | code review / 風險提示 |
| Prompt Engineer | qwen3:8b | 下一輪任務拆解與 prompt |
| Report Writer | qwen2.5-coder:1.5b | final report / dev report 初稿 |

### 高級模式

用途：

- Codex-first fallback
- 一般產品功能閉環，但比一般模式跑得完整
- Codex CLI 優先做真正產品修復與交付
- 本地模型先做整理、摘要、拆題、報告與低風險建議
- Codex CLI 額度不足或暫時不可用時，本地模型先把可安全處理的部分收斂，做不了的高風險任務寫入 deferred queue

| 職位 | 模型 | 工作 |
|---|---|---|
| Error Summarizer | qwen2.5-coder:7b | 較完整的錯誤摘要與阻塞分類 |
| Bug Fix Advisor | qwen2.5-coder:7b | 低風險修補建議，不主導高風險改碼 |
| Code Reviewer | deepseek-coder-v2:lite | code review / 安全與維護性提示 |
| Prompt Engineer | qwen3:8b | 下一輪主題拆解、Codex prompt、deferred queue 整理 |
| Report Writer | qwen2.5-coder:7b | final report / launch delta 初稿 |

高級模式的 Codex CLI 建議：

- 大型功能重構、多檔案聯動、API / auth / tenant / data flow：`GPT-5.5`，reasoning `high`
- 一般產品修復、稍大功能閉環：`GPT-5.4`，reasoning `medium` 到 `high`
- 文件、摘要、prompt、backlog：`GPT-5.4 mini`，reasoning `medium`
- 小整理或低風險建議：`GPT-5.4 mini`，reasoning `low` 到 `medium`

### 睡覺模式

用途：

- 長時間 unattended loop
- 比較慢，但要求比較完整
- 適合整批功能做完後的較完整 QA / 報告

| 職位 | 模型 | 工作 |
|---|---|---|
| Error Summarizer | qwen2.5-coder:7b | 較完整的錯誤摘要 |
| Bug Fix Advisor | qwen2.5-coder:14b | 較長上下文的小修建議 |
| Code Reviewer | qwen3-coder:30b | 深度 review / launch risk |
| Prompt Engineer | qwen3:8b | 下一輪主題、優先順序 |
| Report Writer | qwen2.5-coder:7b | 比較完整的 final report |

## Browser QA

Browser QA 預設順序：

1. Playwright
2. `agy` / Antigravity CLI fallback

原因：

- Playwright 可重現、可自動化、適合長跑
- `agy` 適合補 prompt-driven 的瀏覽器檢查
- `agy` 預設只允許 `Gemini 3.5 Flash`，需要更完整 browser QA 或 Flash 不可用時才 fallback 到 `Gemini 3.5 Pro`
- CLI 版 Antigravity 不該當第一層 gate，避免整個 runner 被卡住

## 不可讓本地模型主導的區域

以下區域只能由 Codex CLI 主導，或至少由 Codex CLI 最終複查：

- Supabase RLS
- Prisma migration
- Production / Staging DB 連線邏輯
- Meta OAuth / token / webhook
- PayUNI callback / billing
- tenant isolation
- admin / owner 權限
- 自動發送與訊息同步核心流程

## AI_TEAM 閉環原則

AI_TEAM 現在的閉環是：

1. Codex CLI 先實作本輪主題
2. QA runner 跑 lite 或 full 驗證
3. 本地模型整理錯誤 / review / 報告 / 下一輪提示詞
4. 若結果可交付，Codex CLI 直接接 commit / push / PR / merge / deploy
5. runner 直接進下一輪，不停在「只回報」

所以：

- 改碼主體是 Codex CLI
- 本地模型是輔助層
- QA 是獨立 gate
- runtime 報告是給下一輪讀，不是流程終點
- git / PR / merge / deployment 在這個版本裡是允許的交付步驟，不再當成預設阻斷點
