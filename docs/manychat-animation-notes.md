# Manychat 首頁動畫紀錄

更新日期：2026-05-24

## 觀察來源

- 目標頁面：https://manychat.com/
- 使用 Chrome DevTools Protocol 檢查 DOM、Network resources、script chunks 與 runtime globals。

## 掃描結果

Manychat 首頁目前是 Next.js / Turbopack 架構。頁面沒有暴露明顯的 `window.gsap` 或 `window.lottie` 全域物件，但 chunk 掃描可看到以下動畫相關字串：

- `framer`
- `gsap`
- `swiper`
- `IntersectionObserver`
- `requestAnimationFrame`
- `webm`
- `transform-gpu`
- `will-change`
- `opacity-0`

實際頁面表現主要由這幾類組合完成：

- 首屏 hero 元素使用 transform / opacity 進場。
- Hero 視覺物件有浮動感與層次位移。
- 部分功能展示使用 `.webm` 影片資源。
- Carousel 區塊使用 Swiper class，例如 `swiper-slide`、`swiper-wrapper`。
- 滾動進場使用 IntersectionObserver 類型的觸發方式。

## InboxPilot 對應設計

這次沒有直接新增 GSAP、Framer Motion、Swiper 三套大型依賴，原因是目前 InboxPilot 首頁不需要完整動畫時間軸或輪播引擎。先用較輕量的方式重現同類視覺：

- CSS keyframes：首屏 stagger 進場、流程節點彈入、藍色連接點 pulse。
- IntersectionObserver：區塊進入視窗時滑入顯示。
- CSS transform / opacity：對齊 Manychat 的輕量動態手感。
- Hero parallax：滑鼠移動時文字、背景泡泡、Flow Builder 卡片以不同深度位移；滾動時不同層級以不同速度位移，接近 Manychat 首頁首屏的視差層次。
- prefers-reduced-motion：使用者系統設定減少動態時，自動關閉動畫。

後續如果要做 Manychat 那種完整 carousel 或影片式功能展示，再補 `swiper` 或 `framer-motion` 會比較合理。
