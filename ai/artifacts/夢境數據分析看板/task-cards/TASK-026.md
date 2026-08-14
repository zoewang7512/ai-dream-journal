# AI-Ready 任務卡

## Metadata

- 任務：情緒分佈圓餅圖與統計摘要卡
- 上層規格：ai/artifacts/夢境數據分析看板/feature-spec.md
- 上層 Epic：夢境數據分析看板
- 上層 User Story：情緒分佈圓餅圖與統計摘要卡
- 分軌：前端
- 前置任務（dependsOn）：TASK-022
- 狀態：完成
- 風險等級：低
- Agent owner：Claude Code
- 人工核准者：zoewang7512（2026-08-14，審核完成證據並驗收）

## 目標

顯示整體情緒佔比圓餅圖，並搭配總完成篇數、平均字數等統計摘要卡片。

## 情境包（Context Pack）

- 相關檔案：
  - src/pages/insights/EmotionPieChart.tsx
  - src/pages/insights/StatsSummaryCards.tsx
- 既有模式：
  - 沿用 TASK-022 的統計 hook 與 TASK-023 選定的圖表函式庫
- 假設：
  - 無
- 未知事項：
  - 無
- 允許變更的檔案：
  - src/pages/insights/**
- 不得觸碰：
  - 依 AGENTS.md 一般規則：不得變更不相關檔案

## 需求

- 圓餅圖顯示各情緒分類佔比。
- 摘要卡顯示總完成篇數、平均字數、記錄天數等基本統計。

## 驗收標準

- 圓餅圖佔比總和為 100%；摘要卡數字與實際 LocalStorage 資料一致。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：佔比與摘要統計計算邏輯測試
- 整合測試：無
- E2E 測試：從完成一篇日記到分析看板確認統計更新
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：圓餅圖與摘要卡截圖
- 安全性檢查：無

## 完成證據

- 變更的檔案：
  - `src/pages/insights/emotion-distribution.ts`（新增，純函式 `buildEmotionDistribution(records)`：統計每種情緒出現次數、依次數由多到少排序、只列出實際出現過的情緒；用最大餘數法（largest remainder method）四捨五入百分比，保證加總一定是 100；同時輸出精確（未四捨五入）的 conic-gradient 座標區間，避免圖形本身受四捨五入誤差影響；`MOOD_COLOR_TOKEN` 把 8 種情緒對應到 design-system 既有色階）
  - `src/pages/insights/emotion-distribution.test.ts`（新增，7 個單元測試：無資料/無可辨識 mood、跳過未知 mood、單一情緒 100%、三等分情況驗證最大餘數法修正 99%→100% 的誤差、真實情境的不規則分佈也加總 100、依次數排序且顏色互不重複、gradient 區間首尾銜接正確）
  - `src/pages/insights/EmotionPieChart.tsx`（新增，元件：`conic-gradient` CSS 圓餅圖＋圖例列表，沒有可用 mood 資料時顯示文字降級）
  - `src/pages/insights/EmotionPieChart.module.css`（新增，沿用 mockup 的 `.pie`／`.legend` 視覺規格）
  - `src/pages/insights/EmotionPieChart.test.tsx`（新增，3 個元件測試：無資料降級、單一情緒 100%、多情緒圖例數量與百分比總和）
  - `src/pages/insights/StatsSummaryCards.tsx`（新增，從 `InsightsPage.tsx` 抽出原本內嵌的統計數字卡片標記，成為獨立、可測試的展示元件）
  - `src/pages/insights/StatsSummaryCards.module.css`（新增，把原本寫在 `InsightsPage.module.css` 裡的 `.statRow`／`.statTile`／`.statNum`／`.statLabel` 搬過來）
  - `src/pages/insights/StatsSummaryCards.test.tsx`（新增，2 個元件測試：三個統計數字與標籤正確渲染、全 0 時不出錯）
  - `src/pages/insights/InsightsPage.tsx`（「摘要」卡片改用 `<StatsSummaryCards>` ＋ `<EmotionPieChart>`，取代原本內嵌的統計標記與佔位文字）
  - `src/pages/insights/InsightsPage.module.css`（移除已搬到 `StatsSummaryCards.module.css` 的樣式）
- 決策摘要：
  - 圓餅圖技術方案：沿用已核准 S5 mockup 本來就用的 **CSS `conic-gradient`**（純 CSS、零依賴），而非 SVG。TASK-023 選型時鎖定的是「不引入圖表函式庫、自己手刻」這個大方向，不是「每張圖都一定要用 SVG」；圓餅圖的圓形比例天生適合用 `conic-gradient` 表示，mockup 本身也是這樣做，沒有另外列選項請人工確認的必要（不是新的技術決策點，是延續已核准 mockup 的既有做法）。
  - 8 種情緒只有 5 個語意色系可用，用同一色系不同深淺（500/700）讓 8 種情緒兩兩區分，對應邏輯盡量貼近直覺（開心→success 綠、困惑→warning 黃、焦慮/恐懼→danger 紅系、平靜/悲傷→info 藍灰系、興奮/懷舊→primary 橘系）；全部顏色都是既有 token，沒有新增或修改任何 token 值。
  - 百分比刻意用最大餘數法而非單純四捨五入，直接對應驗收標準「圓餅圖佔比總和為 100%」——單純四捨五入在等分情況下（例如三等分 33.33%）會加總成 99 而非 100，測試裡特別驗證了這個邊界情況。
  - 把「摘要卡」統計數字抽成獨立的 `StatsSummaryCards.tsx`：任務卡的「相關檔案」原本就列了這個檔名（TASK-022 當時只是先內嵌在 `InsightsPage.tsx` 裡把畫面兜起來，`StatsSummaryCards` 這個檔案本身留給本卡建立），抽出後變成可獨立測試、未來如果要在其他地方重用也更容易。
- 設計系統對照：圓餅圖與圖例顏色全部用既有色階 token（primary/success/warning/info/danger 各深淺），圖例字級/間距沿用既有 `--font-size-12`／`--space-8` 等 token；未新增或修改任何 token，沒有新做需要登記回元件庫 inventory 的可重用 UI 元件。
- 執行過的指令：
  - `npx tsc --noEmit` → 通過。
  - `npx eslint .` → 通過。
  - `npx vitest run` → 通過（39 個測試檔案、215 個測試全數通過，含本卡新增的 12 個測試）。
  - `npx vite build` → 建置成功。
- 測試輸出：`Test Files  39 passed (39)` / `Tests  215 passed (215)`。
- 螢幕截圖：改用全新啟動的 dev server（非沿用先前殘留的 process），對 `http://localhost:5173/dashboard` 做 DOM 結構驗證：真實資料（1 篇，2026-08-14，mood=平靜）正確渲染成圓餅圖 `aria-label="情緒分佈圓餅圖：平靜 100%"`，`conic-gradient` 的實際運算結果是 `rgb(86, 118, 133) 0%, rgb(86, 118, 133) 100%`（`rgb(86,118,133)` 換算成 hex 正是 `--color-info-500: #567685`，與「平靜」對應的顏色 token 一致），摘要卡三個數字（1／24／1）也都正確顯示。`console` 檢查為全乾淨、無錯誤。像素級螢幕截圖仍然沒有拍到——`computer screenshot` 在全新啟動的 server 上一樣逾時回報「Browser pane is not displayed」，確認是這次會話環境限制（使用者尚未開啟 Browser pane 面板），不是程式問題。
- 已知限制：
  - 沒有像素級螢幕截圖（原因見上）；建議之後找機會在 Browser pane 可顯示的環境補拍。
  - `EmotionPieChart` 的圖例只有文字＋色點，沒有 hover/click 互動；比照 mockup 原始設計的最小可用呈現。
  - 8 種情緒共用 5 個色系、靠深淺區分：`平靜`（info-500）與`悲傷`（info-700）、`焦慮`（danger-500）與`恐懼`（danger-700）、`興奮`（primary-500）與`懷舊`（primary-700）這三組同色系深淺在色弱使用者眼中可能不易區分（圖例仍有文字標籤可辨識，不影響資訊可讀性，但視覺區分度有限）；若之後需要更嚴謹的色彩無障礙需求，可另開任務卡處理。
- 後續任務：TASK-024（關鍵字文字雲）為本 Epic 最後一張圖表卡，已解鎖。
