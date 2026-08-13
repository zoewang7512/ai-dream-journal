# AI-Ready 任務卡

## Metadata

- 任務：UI 設計系統 S2：視覺風格方向（Style Tiles）
- 上層規格：ai/artifacts/專案設置/feature-spec.md
- 上層 Epic：專案設置
- 上層 User Story：UI 設計系統／風格指引
- 分軌：前端
- 前置任務（dependsOn）：TASK-004
- 狀態：完成
- 風險等級：低
- Agent owner：Claude Code
- 人工核准者：zoewang7512（2026-08-13，選定 Tile A 暖色調做舊紙；並指示標題／手寫字體改用辰宇落雁體(中)+Corinthia(英)取代原提案的 Caveat/Architects Daughter；審核完成並驗收，2026-08-13）

## 目標

產出 2-3 個仿手繪素描本風格的 style tile 讓人工挑選整體氣質方向。

## 情境包（Context Pack）

- 相關檔案：
  - ai/context/design-system.md
  - ai/artifacts/專案設置/mockups/style-tile-*.html
- 既有模式：
  - 套用 ai/skills/design-craft.md 的設計工藝紀律：色彩情緒、字體個性（Caveat/Architects Daughter 手寫體 + Playfair Display 襯線體）、圓角與陰影傾向、密度、亮暗模式、1-2 個參考產品
- 假設：
  - 以做舊紙張、鉛筆素描為核心意象，3 個 tile 可在暖色調做舊紙、冷色調做舊紙、高對比黑白素描本之間變化
- 未知事項：
  - 無
- 允許變更的檔案：
  - ai/context/design-system.md
  - ai/artifacts/專案設置/mockups/**
- 不得觸碰：
  - 不得使用 S3 尚未定案的 token（此階段本身就是在產生 token 前的方向探索）

## 需求

- 產出 2-3 個 style tile，各自呈現色彩/字體/圓角陰影/密度/明暗模式與參考產品。
- 取得人工核准的風格方向。

## 驗收標準

- design-system.md「風格方向」章節記錄已核准的 tile 與理由。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：無
- 整合測試：無
- E2E 測試：無
- 型別檢查：無
- Lint：無
- Build：無
- 螢幕截圖：3 個 style tile 截圖
- 安全性檢查：無

## 完成證據

- 變更的檔案：
  - `ai/artifacts/專案設置/mockups/style-tile-warm.html`（Tile A · 暖色調做舊紙，選定方向；後續依人工指示改用辰宇落雁體＋Corinthia）
  - `ai/artifacts/專案設置/mockups/style-tile-cool.html`（Tile B · 冷色調做舊紙，候選未選用）
  - `ai/artifacts/專案設置/mockups/style-tile-mono.html`（Tile C · 高對比黑白素描本，候選未選用）
  - `ai/context/design-system.md`（填寫 S2「風格方向」章節：選定 tile、色彩情緒、字體個性、圓角陰影、密度、明暗模式、參考產品、人工核准紀錄；頂部狀態列更新）
- 產出與決策摘要：
  - 3 個 style tile 皆以真實可運行的 HTML/CSS 呈現色彩情緒、字體個性、圓角陰影傾向、密度、明暗模式與 1-2 個參考產品，並用一張示範夢境日記卡片具體演繹整體氣質（非抽象色塊）。
  - 人工核准 Tile A（暖色調做舊紙）為選定方向。
  - 人工進一步指示：手寫字體由原提案的 Caveat（英文）/Architects Daughter（中文字重疊字型）改為「辰宇落雁體」（繁中專用手寫字體）＋「Corinthia」（英文書法體）。已在 `style-tile-warm.html` 套用並記錄於 `design-system.md`。
  - 字體來源查證：「辰宇落雁體」透過 npm 套件 `@fontpkg/chenyuluoyan@1.0.0`（僅提供 `ChenYuluoyan-Thin.ttf`，無現成 CSS，故手動撰寫 `@font-face` 並經 jsDelivr CDN 實際請求驗證回傳合法字型檔）；「Corinthia」為 Google Fonts 收錄字體，經請求 `fonts.googleapis.com` 驗證回傳合法 `@font-face` CSS。未憑空假設字體 CDN 網址。
  - 因兩款新字體都只有單一（細）字重，原本用於標題/手寫元素的 `font-weight: 700` 已全部改為 `400`，避免瀏覽器對單一字重字型做合成假粗體，導致纖細手寫筆畫失真；視覺層次改以字級大小區分（例如 `.type-sample.hand` 從 30px 提高到 36px 以維持可讀性與存在感）。
- 執行過的指令：無程式碼建置相關指令（本任務驗證契約單元/整合/E2E/型別檢查/Lint/Build/安全性檢查皆為「無」，僅螢幕截圖有要求）；有透過 `WebFetch` 查證 `@fontpkg/chenyuluoyan` npm 套件與 jsDelivr 檔案內容、以及 Google Fonts Corinthia 的 CSS 回應，確認兩個字體來源真實可用而非憑空猜測網址。
- 螢幕截圖：以瀏覽器工具開啟並截圖 3 個 style tile（含色彩情緒 swatch、字體個性示範、示範卡片；Tile B 額外截圖亮色與暗色兩種卡片呈現）；套用新字體後另外重新截圖 Tile A 的標題（辰宇落雁體）、示範卡片標題（辰宇落雁體）與雙語字體示範行（「Dream Journal · 今天夢到一座燈塔」同時展示 Corinthia 與辰宇落雁體），確認渲染正常、無破版或缺字方塊。
- 已知限制：
  - `ChenYuluoyan-Thin.ttf` 檔案約 4.3–4.5MB（未切字、未轉 woff2），目前僅用於 mockup／design-system 展示；若最終定案採用此字體，S4/S3 落地到正式專案時應評估子集化（subsetting）或轉 woff2 以降低載入成本，此為後續任務的已知風險，非本任務範圍。
  - 兩個新字體都只有單一字重（辰宇落雁體僅 Thin；Corinthia 雖有 400/700 但字重差異在手寫字體上不明顯），未來若元件庫（S4）需要更粗的手寫強調樣式，可能需要另尋輔助字重或改用陰影/顏色做層次。
  - Tile B、C 的 HTML 檔案予以保留（未刪除）但非選定方向，僅供未來若需要重新評估風格方向時參考，不會被後續 S3/S4 任務使用。
- 後續任務：TASK-006（S3：Design Token）可以開始，需將本階段選定的色彩／字體／圓角／陰影／密度值提煉為正式 design token。
