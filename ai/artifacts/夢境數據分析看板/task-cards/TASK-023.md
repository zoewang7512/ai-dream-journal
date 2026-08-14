# AI-Ready 任務卡

## Metadata

- 任務：情緒趨勢折線圖
- 上層規格：ai/artifacts/夢境數據分析看板/feature-spec.md
- 上層 Epic：夢境數據分析看板
- 上層 User Story：情緒趨勢折線圖
- 分軌：前端
- 前置任務（dependsOn）：TASK-022
- 狀態：完成
- 風險等級：低
- Agent owner：Claude Code
- 人工核准者：zoewang7512（2026-08-14，審核完成證據並驗收）

## 目標

依時間軸顯示夢境情緒分類的變化趨勢。

## 情境包（Context Pack）

- 相關檔案：
  - src/pages/insights/EmotionTrendChart.tsx
- 既有模式：
  - 沿用 TASK-022 的統計 hook；圖表函式庫選型需列 2-3 個選項（如 Recharts、Chart.js、純 SVG）比較後決定並記錄
- 假設：
  - 無
- 未知事項：
  - 圖表函式庫選型——實作時列選項請人工確認或依專案已有慣例決定
- 允許變更的檔案：
  - src/pages/insights/**
- 不得觸碰：
  - 依 AGENTS.md 一般規則：不得變更不相關檔案

## 需求

- X 軸為日期、Y 軸為情緒分類，依全部歷史 completed 資料繪製。
- 僅 1 篇資料時需優雅顯示單點，不得報錯或留白當機。

## 驗收標準

- 多筆與單筆資料情境皆正確渲染。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：資料轉換為圖表座標的邏輯測試
- 整合測試：無
- E2E 測試：無
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：多筆與單筆資料的折線圖截圖
- 安全性檢查：無

## 完成證據

- 變更的檔案：
  - `src/pages/insights/emotion-trend.ts`（新增，純函式邏輯：`MOOD_ORDER` 固定情緒順序（與後端 `server/lib/analyze-dream.ts` 的 `MOOD_OPTIONS` 一致）、`buildEmotionTrendLayout()` 把 records 轉成 SVG 座標（含單點置中、多點依日期排序算 x/y、防禦缺 mood 或未知 mood 的紀錄）、`formatAxisDate()` 精簡日期格式）
  - `src/pages/insights/emotion-trend.test.ts`（新增，9 個單元測試：空陣列、單點置中不除以 0、多點依日期由舊到新排序、mood 對應到穩定 y 座標、跳過缺失/未知 mood 的紀錄、polyline 座標字串不含 NaN、日期格式化）
  - `src/pages/insights/EmotionTrendChart.tsx`（新增，SVG 圖表元件：多點畫 `polyline`+`circle`、單點只畫 `circle` 不畫線、完全沒有可用 mood 資料時顯示「暫無可顯示的情緒資料」文字降級而非壞掉的圖表）
  - `src/pages/insights/EmotionTrendChart.module.css`（新增）
  - `src/pages/insights/EmotionTrendChart.test.tsx`（新增，4 個元件測試：無可用資料時的降級文字、單點不畫線、多點畫線且依日期排序、跳過未知 mood 但仍渲染其餘點）
  - `src/pages/insights/InsightsPage.tsx`（把「情緒趨勢」卡片的佔位文字換成真正的 `<EmotionTrendChart records={stats.records} />`）
  - `src/pages/insights/InsightsPage.test.tsx`（既有的兩個「有資料」測試補上 `analysis` 欄位，讓情緒趨勢圖表真的有資料可畫；單篇邊界案例測試新增斷言確認圖表 `role="img"` 元素確實渲染出來）
- 決策摘要：
  - 圖表函式庫選型：列了「純 SVG 手刻」「Recharts」「Chart.js(react-chartjs-2)」三個選項並附優劣，與您確認後選用**純 SVG 手刻**——零新依賴，直接比照已核准的 S5 mockup 本來就是手刻 SVG polyline 的做法，也符合專案 S1 已定調的「視覺高度客製化、headless/自建優於現成套件覆寫成本」原則。
  - Y 軸（情緒分類）用固定順序而非依資料動態排序，順序直接沿用後端 `MOOD_OPTIONS` 常數（前後端目前沒有共用型別套件，兩邊分別維護，已加註解提醒需與後端保持一致）。
  - mockup 原始版面沒有畫 Y 軸標籤（純示意圖），但這張卡接的是真實資料，沒有標籤的話一條線在 8 種情緒間跳動會讓人看不懂在畫什麼，所以額外加了左側 8 個情緒文字標籤（用 token 顏色與既有 `axis-label` 字體慣例），這是讓 mockup 抽象版面變成真正可用圖表的必要補充，不算脫離設計系統。
  - 資料格式異常（completed 但缺 analysis，或 mood 不在已知 8 種之列）時不會讓整個區塊白屏或畫出 NaN 座標，而是分兩層防禦：`emotion-trend.ts` 直接濾掉該筆、`EmotionTrendChart.tsx` 在濾完後一筆都不剩時顯示文字降級——對應 feature-spec 明訂的「LocalStorage 資料格式異常時該圖表區塊需優雅降級」要求。
- 設計系統對照：SVG 線條/圓點顏色用 `--color-primary-500`／`--color-primary-600`，軸標籤與 mood 標籤用 `--color-text-tertiary`＋既有 `ui-monospace` 字體慣例（沿用 mockup 的 `.axis-label` 風格），未新增任何 token；沒有新做需要登記回元件庫 inventory 的可重用 UI 元件（`EmotionTrendChart` 是頁面二專屬的圖表元件，不是通用 UI 元件）。
- 執行過的指令：
  - `npx tsc --noEmit` → 通過。
  - `npx eslint .` → 通過。
  - `npx vitest run` → 通過（34 個測試檔案、190 個測試全數通過，含本卡新增的 13 個測試）。
  - `npx vite build` → 建置成功。
- 測試輸出：`Test Files  34 passed (34)` / `Tests  190 passed (190)`。
- 螢幕截圖：本次會話的 Browser pane 一樣沒有被開啟顯示（`computer screenshot` 逾時，pane not compositing frames），無法拍像素截圖。改用 `javascript_tool`／`get_page_text` 對正在跑的真實 dev server（`http://localhost:5173/dashboard`）做 DOM 結構驗證：目前瀏覽器裡的真實資料是 1 篇 2026-08-14、mood=平靜 的完成日記，圖表正確渲染成 `circleCount:1`、`polylineCount:0`（單點不畫線，符合預期）、`moodLabelCount:9`（8 個情緒標籤＋1 個日期標籤）、`aria-label` 正確描述「情緒趨勢折線圖：2026-08-14 到 2026-08-14，共 1 筆紀錄」。多筆資料情境沒有在真實瀏覽器裡另外造假資料測試（避免污染您的真實 LocalStorage），改以 `emotion-trend.test.ts`／`EmotionTrendChart.test.tsx` 的隔離自動化測試覆蓋（3 筆不同日期/情緒的多點排序與畫線邏輯）。
- 已知限制：
  - 沒有做像素級螢幕截圖（原因見上）；建議之後找機會在 Browser pane 有顯示的環境下補拍多筆與單筆資料的實際畫面截圖。
  - 圖表沒有 hover tooltip 互動（只有 SVG `<title>` 提供瀏覽器原生 hover 提示，顯示日期＋情緒），純 SVG 手刻方案的已知取捨，需要更豐富互動的話要另外手刻。
  - Y 軸 8 個情緒類別固定佔用垂直空間，完成篇數很多時 X 軸上的點會越擠越密（因為 viewBox 寬度固定為 600，用 `preserveAspectRatio="none"` 讓瀏覽器拉伸塞滿容器寬度），沒有另外做「資料點過多時橫向捲動或降採樣」的處理；目前累積 12 篇資料量還不會有實際問題，資料量大幅成長後可能需要另開任務卡優化。
- 後續任務：TASK-024（關鍵字文字雲）、TASK-025（紀錄月曆熱力圖）、TASK-026（情緒圓餅圖＋摘要卡）三張卡現在都已解鎖（皆只依賴 TASK-022），可任選順序接續。
