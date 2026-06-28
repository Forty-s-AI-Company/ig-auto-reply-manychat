# Launch Criteria

## Build Gates

- `npm run lint` 通過
- `npm run build` 通過
- `npm test` 通過，或明確記錄為缺少非 production 測試環境
- 需要時補 `npm run test:e2e`

## Product Gates

- 使用者可以登入
- Inbox 可以載入與操作
- Contacts 可以查找、編輯、標籤管理
- Channels 可以清楚連接與重新讀取 IG metadata
- Automations 有明確範圍與不可用狀態說明
- Analytics 反映實際資料

## Security Gates

- 不提交 `.env`
- `.env.example` 完整
- OAuth callback 有錯誤處理
- Webhook 有驗證或清楚 TODO
- PayUNI callback 有驗證或清楚 TODO
- 使用者資料有 tenant / workspace 邊界
- production DB 不可被 AI 無腦寫入

## Release Gates

- `README` 可讓人理解目前流程
- `AI_TEAM` 文件能接手下一輪
- 殘留風險有被寫進 `reports/final-report.md`
- 需要人工作業的項目有 `HUMAN_REQUIRED` 記錄
