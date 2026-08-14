# AI-Ready 任務卡

## Metadata

- 任務：夢境紀錄月曆熱力圖
- 上層規格：ai/artifacts/夢境數據分析看板/feature-spec.md
- 上層 Epic：夢境數據分析看板
- 上層 User Story：夢境紀錄月曆熱力圖
- 分軌：前端
- 前置任務（dependsOn）：TASK-022
- 狀態：完成
- 風險等級：低
- Agent owner：Claude Code
- 人工核准者：zoewang7512（2026-08-14，審核完成證據並驗收）

## 目標

以月曆熱力圖顯示哪些日期有完成的夢境紀錄，可切換月份。

## 情境包（Context Pack）

- 相關檔案：
  - src/pages/insights/CalendarHeatmap.tsx
- 既有模式：
  - 沿用 TASK-022 的統計 hook
- 假設：
  - 無
- 未知事項：
  - 無
- 允許變更的檔案：
  - src/pages/insights/**
- 不得觸碰：
  - 依 AGENTS.md 一般規則：不得變更不相關檔案

## 需求

- 以顏色深淺表示當天是否有完成紀錄。
- 提供月份切換，切換不影響其他圖表區塊。

## 驗收標準

- 切換月份後熱力圖正確更新，其餘圖表不受影響。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：月曆資料聚合邏輯測試
- 整合測試：無
- E2E 測試：無
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：有紀錄月份與切換後月份的截圖
- 安全性檢查：無

## 完成證據

- 變更的檔案：
  - `src/pages/insights/calendar-heatmap.ts`（新增，純函式：`buildCalendarHeatmap(records, year, month)` 把 completed 紀錄聚合成該月的月曆格子（含月初留白對齊星期幾、每格是否有紀錄）；`shiftMonth(year, month, delta)` 正確處理跨年份的月份進位/借位；`DAYS_OF_WEEK` 星期標籤常數）
  - `src/pages/insights/calendar-heatmap.test.ts`（新增，9 個單元測試：無資料時格子數與留白數正確、只標記目標年月內有紀錄的日期、忽略月份/年份不符的紀錄、閏年 2 月天數正確、`shiftMonth` 同年前進/後退與跨年進位/借位）
  - `src/pages/insights/CalendarHeatmap.tsx`（新增，元件：月份切換按鈕（重用既有 `Button` ghost variant）＋ 7×N 月曆格子，用顏色深淺（token）表示當天是否有完成紀錄；`initialDate` 為可選 prop，預設今天，測試時可注入固定日期避免依賴系統時鐘，比照 `journal/date.ts` 既有的 `getTodayDateString(referenceDate = new Date())` 慣例）
  - `src/pages/insights/CalendarHeatmap.module.css`（新增，沿用 mockup 的 heatmap 視覺規格）
  - `src/pages/insights/CalendarHeatmap.test.tsx`（新增，4 個元件測試：星期標題與初始月份標籤、有紀錄日期正確標示、切到下一月正確更新、切到上一月正確跨年）
  - `src/pages/insights/InsightsPage.tsx`（把「紀錄月曆」卡片的佔位文字換成真正的 `<CalendarHeatmap records={stats.records} />`）
  - `src/pages/insights/InsightsPage.test.tsx`（新增整合測試：切換月曆熱力圖的月份後，情緒趨勢圖表與摘要統計數字都不受影響——直接對應驗收標準「切換月份後熱力圖正確更新，其餘圖表不受影響」）
- 決策摘要：
  - 沒有列選項讓人工確認：這張卡的任務卡本身沒有標「未知事項」（不像 TASK-023 需要選圖表函式庫），版面與互動直接比照已核准的 S5 mockup（月份切換按鈕＋7 欄格子），沒有需要決策的技術選型。
  - 月份切換狀態（`year`/`month`）是 `CalendarHeatmap` 元件內部的 local state，不放進 `useDreamStats` 或往上提到 `InsightsPage`——這樣天生保證「切換月份不影響其他圖表區塊」（其他區塊根本拿不到、也不依賴這個月份狀態），不需要額外寫程式碼去「避免影響」，用元件邊界直接讓這件事不可能發生。
  - 用 `new Date(year, month-1, day)` 這種帶年月日分量的建構子計算星期幾／該月天數，而非解析 ISO 字串（`new Date("2026-08-01")` 會被當成 UTC 解析，可能因為時區造成星期幾算錯一天）——這是使用者本機牆上時間的月曆，用本機時間分量建構最安全。
  - `initialDate` 可選 prop 的設計比照專案裡 `src/pages/journal/date.ts` 的 `getTodayDateString(referenceDate = new Date())` 既有慣例，維持一致的「預設用真實時間、測試時可注入固定時間」寫法，不是本卡新發明的模式。
- 設計系統對照：格子顏色用 `--color-primary-500`（有紀錄）／`--color-grey-200`（無紀錄），月份切換按鈕重用既有 `Button` ghost variant（比對 mockup 的 `.btn` 樣式，顏色/邊框/字體與 ghost variant 定義完全一致，未另外覆寫樣式），星期與月份標籤字體沿用 mockup 的 `ui-monospace` 慣例；未新增或修改任何 token，沒有新做需要登記回元件庫 inventory 的可重用 UI 元件。
- 執行過的指令：
  - `npx tsc --noEmit` → 通過。
  - `npx eslint .` → 通過。
  - `npx vitest run` → 通過（36 個測試檔案、203 個測試全數通過，含本卡新增的 13 個測試）。
  - `npx vite build` → 建置成功。
- 測試輸出：`Test Files  36 passed (36)` / `Tests  203 passed (203)`。
- 螢幕截圖：Browser pane 一樣沒有被開啟顯示，無法拍像素截圖（`computer screenshot` 逾時）。改用 `get_page_text`／`javascript_tool` 對正在跑的真實 dev server（`http://localhost:5173/dashboard`）做結構驗證：確認真實完成紀錄（2026-08-14）正確顯示在月曆格子上（`title="8月14日：已完成紀錄"`），月份標籤正確顯示「2026年8月」（與系統當前日期一致）。月份切換的即時互動用 `computer` 點擊「下一月」按鈕嘗試驗證時，因為 Browser pane 沒有實際顯示、無法合成畫面，`computer` 的座標點擊也不可靠（同一個「pane 未顯示」限制），沒有得到可信結果；改以 `CalendarHeatmap.test.tsx` 裡的自動化互動測試（`userEvent.click`）驗證月份切換邏輯，含跨年份切換的邊界案例。
- 已知限制：
  - 沒有做像素級螢幕截圖與即時瀏覽器點擊驗證月份切換（原因見上，Browser pane 未顯示）；建議之後找機會在 pane 可顯示的環境補做。
  - 月曆格子沒有鍵盤導覽或 `role="gridcell"` 等 ARIA grid 語意，只有滑鼠 hover 可看到的原生 `title` tooltip；比照 mockup 原始設計的最小可用互動，若之後需要更完整的無障礙支援可另開任務卡處理。
- 後續任務：TASK-026（情緒圓餅圖＋摘要卡）、TASK-024（關鍵字文字雲）仍待接續，皆已解鎖。
