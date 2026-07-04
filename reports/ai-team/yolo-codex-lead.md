**Release 判定**

目前從 active canonical 文件看，InboxPilot 已經很接近 `sale-ready beta`，但**還不能直接判定為 sale-ready beta**。原因不是本機產品主線，而是外部與 staging 證據還沒完全關門。

目前狀態應維持：`CONTINUE`  
不是 `BETA_READY_CANDIDATE`，也不是 production-ready。這邊不能硬喊上線，不然就像我以為我快完成，結果文件又提醒我 Meta 還卡著，人生就是這樣。

**Top P0/P1 Blockers**

1. **Meta / Instagram Advanced Access 尚未通過**
   - Required Instagram permissions 仍是 `可供測試`。
   - App Review / Advanced Access / Business Verification 還是人工 Hold。
   - 這是 P0 external，會直接影響真實 IG 訊息、留言、媒體與 reviewer evidence。

2. **Reviewer-safe staging real asset evidence 還沒完整完成**
   - 本機 reviewer rehearsal 已有證據。
   - 但 staging 上的 reviewer-safe Instagram asset、連線 channel、webhook-backed proof、最終錄影與 redaction 還沒完成。
   - 這會擋 sale-ready beta 的可信度，尤其 target 包含 staging。

3. **PayUNI production switch 仍是 Hold**
   - Sandbox flow 可驗證。
   - 但 production merchant approval、正式低額 live smoke、退款 / 對帳 SOP 仍需人工核准。
   - 若 sale-ready beta 只收 whitelist / sandbox 或人工開通，可以暫不擋 beta；若要正式收款，這是 P0 gate。

4. **Production deploy / production DB mutation 明確禁止自動化**
   - 目前文件仍要求 production deploy、production DB migration / mutation 都必須人工批准。
   - 對 local / staging stabilization 不擋，但對公開販售一定擋。

**是否可視為 Sale-Ready Beta**

從目前證據看：

- **Local：接近可接受**
  - lint / build / test 曾通過。
  - empty workspace、Inbox、Contacts、Automations、Billing、Referrals、Wallet、Affiliate、public/legal pages 都有本機 smoke 或 source-level guard。
  - 沒有新的 P0/P1 visible-but-unusable、raw provider error、mobile overflow、假按鈕證據。

- **Staging：還差最後證據**
  - staging health 與部分 empty tenant / reviewer-safe evidence 有進展。
  - 但 Meta reviewer-safe real asset lane 與最終錄影 / redaction / asset handoff 尚未完成。

所以我會判定：

```text
Sale-ready beta from current evidence: NO
Closest safe state: CONTINUE, near BETA_READY_CANDIDATE after staging reviewer-safe evidence pass
```

**最高槓桿下一步**

跑一輪 **staging reviewer-safe evidence lane**，但不碰 production：

```bash
python scripts/ai_release_autopilot.py --mode qa-only --profile staging-aggressive
```

目標只收證據，不送審、不部署 production、不碰 production DB：

- staging Dashboard
- Channels connected Instagram state
- Inbox reviewer-safe conversation
- Contacts reviewer-safe contact
- Automations reviewer-safe draft
- Billing / PayUNI Sandbox copy
- console / network / mobile RWD
- redaction-safe screenshots / notes

這一輪若無 P0/P1，就可以比較合理地提出 `BETA_READY_CANDIDATE` 給人類 final acceptance。

**不可自動化的人類 Gates**

- Meta App Review final submit
- Business Verification / Advanced Access 最終確認
- Reviewer-safe credentials handoff
- Final reviewer recording、screenshots、redaction review
- PayUNI production merchant switch
- Real payment / low-value live smoke
- Production deploy
- Production DB migration / mutation
- Final `BETA_READY_CANDIDATE` acceptance

**本輪輸出狀態**

- diff summary：無程式變更，只讀指定 active 文件。
- validation evidence：已依要求閱讀 canonical / readiness / launch / roadmap 文件。
- remaining risks：Meta approval、staging real asset evidence、PayUNI production、production deploy / DB gates。
- human blockers：上述所有人工 gates。
- state：`CONTINUE`。
