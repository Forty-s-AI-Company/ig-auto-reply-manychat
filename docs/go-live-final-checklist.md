# InboxPilot 上線前最後驗收表

這份文件只回答一件事：`現在能不能上線，以及上線前還差什麼。`

判準：

- `[x]` 已具備：程式、文件或驗證結果顯示目前已經完成。
- `[ ]` 上線前必做：不做就不建議上正式環境。
- `[-]` 可延後：不影響第一階段 private beta / 小規模商用上線。

## 建議上線範圍

建議第一階段只以 `private beta / 小規模正式客戶` 為目標，不要宣稱為可承受大量公開流量的 SaaS。

建議第一階段可開放：

- Instagram / Messenger Inbox 與基礎自動化
- Telegram outbound
- Email SMTP outbound
- Contacts / Tags / Custom Fields
- Broadcasts
- Sequences

不建議第一階段承諾：

- WhatsApp 正式營運
- TikTok 正式營運
- SMS 正式營運
- 高併發大流量保證

## 一、程式與核心流程

- [x] `npm run lint` 可通過。
- [x] `npm test` 可通過。
- [x] `npm run build` 可通過。
- [x] Inbox / Contacts / Automations / Broadcasts / Sequences 已有可運作畫面與 API。
- [x] Broadcast 已有 preview，可先看候選收件人再排程。
- [x] Email channel 已支援 SMTP outbound。
- [x] Telegram channel 已支援 outbound。
- [x] Worker / queue 基礎已完成，支援 DB fallback 與 Redis/BullMQ。
- [ ] 請在 staging 或 production URL 實際走一次完整真人驗收：
  login -> connect channel -> inbound webhook -> reply -> automation -> broadcast -> sequence

## 二、正式上線必做

- [ ] 設定正式 `APP_URL` 與 HTTPS domain。
- [ ] 設定強 `AUTH_SECRET`。
- [ ] 使用正式 Postgres，不使用本機或開發資料庫。
- [ ] 準備資料庫備份與 rollback 流程。
- [ ] 設定 `REDIS_URL`，不要只靠 DB polling worker。
- [ ] 獨立部署 worker，確認 `npm run worker` 在正式環境可穩定消費 job。
- [ ] 設定正式 webhook URL，並逐一驗證：
  `/api/webhooks/meta`
  `/api/webhooks/telegram`
  `/api/billing/payuni/notify`
  `/api/billing/payuni/return`
- [ ] 準備最基本監控：
  request error log、worker error log、queue depth、DB error
- [ ] 建立 production admin 帳號，停用任何不該留在正式環境的 demo / seed 資料。

## 三、Meta / Instagram / Messenger

這一段是最容易讓人誤判的。程式有了，不代表正式可用。

- [x] Meta OAuth、webhook、comment / DM 相關程式主流程已存在。
- [x] 已有 Meta App Review checklist 文件。
- [ ] Meta App 必須切到 Live mode。
- [ ] 必須完成 App Review / Advanced Access。
- [ ] 必須確認 reviewer / 客戶帳號能正確授權指定資產。
- [ ] 若 Meta 要求，必須完成 Business Verification。
- [ ] 必須用正式 Instagram professional account 實測：
  connect -> 收 DM -> Inbox 顯示 -> 從系統回覆 -> comment trigger

如果上面這段沒完成，Instagram / Messenger 只能算「技術已接好，但尚未達正式營運條件」。

## 四、安全與合規

- [x] Prisma config、env handling、server-only secret 基本分層已存在。
- [x] webhook secret / HMAC 基礎保護已支援部分路徑。
- [x] Privacy Policy / Terms / Data Deletion 頁面已有路由。
- [ ] 實際確認正式站上的 Privacy Policy、Terms、Data Deletion 內容已可對外使用。
- [ ] 確認所有第三方 key / token 都只存在 server env，不存在前端 bundle。
- [ ] 確認 production `.env` 沒有沿用測試帳號、測試 token、sandbox 金流設定。
- [ ] 針對 admin / operator 實際驗一次權限邊界。

## 五、效能與營運風險

- [x] 已做過 1000-user load test，並有結果文件。
- [x] 文件已明確指出目前不能宣稱可承受 1000 人同時在線。
- [ ] 正式上線前，請接受第一階段只做小量流量，不做大規模公開宣稱。
- [ ] 若要公開大規模上線，先補：
  dedicated queue worker、更多快取、summary materialization、進一步壓測與觀測

## 六、可延後到第二階段

- [-] WhatsApp 正式 template / session policy mapping
- [-] TikTok 官方 provider 串接
- [-] SMS provider 選型與串接
- [-] Broadcast 審核流程、退訂中心、節流策略 UI
- [-] Conversation assignment、搜尋、分頁、更多 team roles
- [-] 更完整 billing / affiliate / payout 自動化
- [-] Sentry / metrics dashboard / slow query tracing
- [-] 大流量高併發優化與再壓測

## 七、最終判定

目前比較合理的結論是：

- `可以上線`：如果目標是小規模、受控範圍、private beta 或少量正式客戶。
- `不建議直接公開大規模商用宣稱`：因為 Meta 正式權限與高併發能力都還不是完全關帳狀態。

## 八、上線前最後一天要做的事

- [ ] 用正式網址走一次完整流程錄影。
- [ ] 驗證 Redis / worker / webhook / PayUNI callback 都在正式環境正常。
- [ ] 建立一組乾淨的測試 workspace，不含真客戶資料。
- [ ] 把 admin 帳號、金流、Meta、Telegram、Email SMTP 都換成正式憑證。
- [ ] 保留 rollback 計畫：domain、env、DB backup、worker stop / restart。
