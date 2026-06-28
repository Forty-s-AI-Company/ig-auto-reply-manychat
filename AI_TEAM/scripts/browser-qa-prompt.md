# Browser QA Prompt

```text
請只做 Browser QA，不要做大範圍程式碼重構。

任務：
1. 打開本機頁面與已部署頁面。
2. 檢查登入、Dashboard、Inbox、Contacts、Channels、Automations、Analytics。
3. 驗證按鈕、表單、Modal、Toast、Loading、Empty State。
4. 檢查桌機與手機寬度。
5. 若有問題，只修最小必要的前端 / UI 程式碼。
6. 不要修改 OAuth、Supabase RLS、PayUNI、Webhook、資料庫 migration。
7. 若無法實測某條流程，請明確寫出阻塞原因，不要假裝通過。
8. 完成後輸出 Browser QA Markdown 報告。
```
