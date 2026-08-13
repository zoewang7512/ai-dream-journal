# AI-Ready 任務卡

## Metadata

- 任務：UI 設計系統 S3：Design Token
- 上層規格：ai/artifacts/專案設置/feature-spec.md
- 上層 Epic：專案設置
- 上層 User Story：UI 設計系統／風格指引
- 分軌：前端
- 前置任務（dependsOn）：TASK-005
- 狀態：完成
- 風險等級：低
- Agent owner：Claude Code
- 人工核准者：zoewang7512（2026-08-13；grey/primary/success 沿用 S2 既有色直接核准；danger/warning/info 三個新衍生色階經確認「顏色都很好」核定；審核完成並驗收，2026-08-13）

## 目標

從已核准的風格方向定義完整 primitive token 與 semantic token，並產出可執行的 token 檔案。

## 情境包（Context Pack）

- 相關檔案：
  - ai/context/design-system.md
  - src/styles/tokens.css（或等效）
- 既有模式：
  - 套用 design-craft.md 的 type scale、4 的倍數間距、色彩系統分階規則
- 假設：
  - 無
- 未知事項：
  - 無
- 允許變更的檔案：
  - ai/context/design-system.md
  - src/styles/**
- 不得觸碰：
  - 不得引入 S2 未核准的色彩/字體

## 需求

- 定義色票、字級 scale、字重、行高、間距 scale、圓角、陰影、z-index、動效時間曲線。
- 定義語意層 token（color.primary、color.surface、color.danger、space.page 等）。
- 產出真實可執行的 tokens.css 並在 design-system.md 記錄路徑。

## 驗收標準

- design-system.md「Design Token 清單」完整列出並經人工核准。
- tokens.css 可被前端專案實際引用。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：無
- 整合測試：無
- E2E 測試：無
- 型別檢查：無
- Lint：CSS lint（若專案有設定）
- Build：前端可正常引用 tokens.css 建置成功
- 螢幕截圖：色票/字級/間距 token 一覽截圖
- 安全性檢查：無

## 完成證據

- 變更的檔案：
  - `src/styles/tokens.css`（新增，真實可執行的 `:root` CSS custom properties：色彩 primitive 6 組 × 10 階、字體/字級/字重/行高、間距 scale、圓角、陰影、z-index、動效、以及 semantic token 層）
  - `src/main.tsx`（新增 `import "./styles/tokens.css"`，讓 token 真正被前端建置引用）
  - `ai/artifacts/專案設置/mockups/design-tokens-preview.html`（新增，token 視覺化預覽頁，供本次審核與未來回顧）
  - `ai/context/design-system.md`（填寫 S3「Design Token 清單」完整 primitive／semantic 表格與 token 檔路徑；頂部狀態列更新為 S3 已核准）
- 決策摘要：
  - grey／primary／success 三個色階直接沿用 S2 已核准的基準色，補齊 50–900 完整 10 階（S2 mockup 當時只示範了部分階數）。
  - 新衍生 danger（磚紅 `#b0402a`）／warning（芥末黃 `#b57c22`）／info（霧藍灰 `#567685`，唯一冷色例外）三個語意色階：因為 S2 style tile 沒有展示過這三色，先產出視覺化預覽頁並明確標記「NEW」向人工說明衍生邏輯（與現有色系的關係、為何選擇偏暖色調、info 為何保留冷色例外），經確認「顏色都很好」後核定，未自行悶頭決定。
  - 圓角／陰影 token 直接從 S2 已核准 mockup 實際使用的數值（16px 卡片圓角、10px 按鈕圓角、暖色硬邊位移陰影）萃取，未新發明數值。
  - z-index／動效 token 目前沒有任何元件使用（Modal/Toast 等留給 S4），採業界常見慣例值（z-index 分層 1000–1500；動效 120/200/320ms + standard/out 兩種 easing），非風格判斷，故未另外請示。
  - token 檔採原生 CSS custom properties（非 Sass/Less 變數、非 JS theme object），與 S1 已核准的「CSS Modules」樣式方案一致——CSS Modules 元件檔案可直接 `var(--color-primary)` 引用，不需額外建置工具。
- 執行過的指令與結果：
  - `npx tsc --noEmit` → 通過。
  - `npx eslint .` → 通過。
  - `npx vitest run` → 3 個測試檔、18 個測試全數通過（不受影響）。
  - `npm run build` → 成功，且首次產出獨立 CSS 資源檔（`dist/assets/index-*.css`，3.65kB／gzip 1.25kB），證實 `tokens.css` 真的被前端建置流程引用打包，而非孤立檔案。
- 螢幕截圖：以瀏覽器工具開啟 `design-tokens-preview.html` 並截圖 grey／primary 色階、字級 type scale 區塊，確認辰宇落雁體／Corinthia／Playfair Display 皆正確渲染、色票排版正常；本輪瀏覽器截圖工具對「捲動後截圖」不穩定（多次捲動後畫面凍結在空白區塊），改以 `getComputedStyle` 讀取 danger／warning／info 三個色階第一階的實際渲染色值（`rgb(251,238,236)`／`rgb(238,242,244)`／`rgb(251,243,227)`，換算回 hex 分別精確對應 `#fbeeec`／`#eef2f4`／`#fbf3e3`）佐證 CSS 變數確實正確套用，作為螢幕截圖之外的補充驗證證據。
- 已知限制：
  - 螢幕截圖未能涵蓋 danger/warning/info 色票與間距/圓角/陰影/動效區塊的實際畫面（瀏覽器工具捲動後 compositing 異常，已改用 computed style 驗證替代，見上）；建議使用者本機直接開啟 `design-tokens-preview.html` 做最終視覺確認。
  - `ChenYuluoyan-Thin.ttf`（約 4.3MB，未子集化/未轉 woff2）與 Google Fonts 的 Corinthia 皆為外部 CDN 依賴，目前 `tokens.css` 直接以 `@font-face` 引用 jsDelivr 網址；正式上線前應評估是否自行代管字型檔或做子集化，降低外部依賴與載入成本（此為 S2 任務就已記錄的已知風險，此處延續）。
  - z-index／動效 token 目前尚無任何元件實際使用，其合理性要等 S4 元件庫階段實作 Modal/Toast 等元件時才能真正驗證。
  - Review gates（product/ui/architecture/security/test/code_review）尚待人工審核確認。
- 後續任務：TASK-007（S4：核心元件庫）可以開始，需依本階段的 primitive／semantic token 實作 Button/Input/Select/Card/Nav/Modal/Table/Form/Toast 等元件並登記回 `design-system.md` 元件庫 inventory。
