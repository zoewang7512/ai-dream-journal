# AI-Ready 任務卡

## Metadata

- 任務：分析看板架構基礎（容器、統計工具、空狀態）
- 上層規格：ai/artifacts/夢境數據分析看板/feature-spec.md
- 上層 Epic：夢境數據分析看板
- 上層 User Story：資料不足時的空狀態設計
- 分軌：前端
- 前置任務（dependsOn）：TASK-001、TASK-002、TASK-003、TASK-004、TASK-005、TASK-006、TASK-007、TASK-008、TASK-009
- 狀態：完成
- 風險等級：低
- Agent owner：Claude Code
- 人工核准者：zoewang7512（2026-08-14，審核完成證據並驗收）

## 目標

建立頁面二的共用容器，套用 S5 已核准版型，提供讀取 completed 日記並計算共用統計的工具函式，並實作完成篇數為 0 時四個圖表區塊一致的空狀態。

## 情境包（Context Pack）

- 相關檔案：
  - src/pages/insights/InsightsPage.tsx
  - src/pages/insights/useDreamStats.ts
- 既有模式：
  - 沿用 design-system.md 頁面二版型；資料來源為 src/lib/dream-storage.ts 的 listCompleted
- 假設：
  - 無
- 未知事項：
  - 無
- 允許變更的檔案：
  - src/pages/insights/**
- 不得觸碰：
  - 不得修改日記記錄或 AI 引擎 Epic 的程式碼
  - 不得引入未登記在元件庫 inventory 的新元件

## 需求

- 提供共用的統計計算 hook/工具，供後續 4 個圖表卡片共用（避免各自重複讀取與計算）。
- 完成篇數為 0 時，所有圖表區塊顯示一致的引導文案與「前往寫日記」CTA。

## 驗收標準

- 空狀態與有資料狀態切換正確；空狀態文案在四個區塊一致。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：統計 hook 基本聚合邏輯測試
- 整合測試：與 dream-storage 的讀取整合測試
- E2E 測試：無（併入各圖表卡片）
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：空狀態畫面截圖，比對 S5 版型
- 安全性檢查：無

## 完成證據

- 變更的檔案：
  - `src/pages/insights/useDreamStats.ts`（新增，共用統計 hook：讀取 `listCompleted()`，回傳 `records`／`totalCompleted`／`averageWordCount`／`daysRecorded`／`isEmpty`）
  - `src/pages/insights/useDreamStats.test.ts`（新增，6 個單元測試：0 篇時全部歸零、忽略 draft 只算 completed、平均字數計算與四捨五入、記錄天數、單篇邊界案例）
  - `src/pages/insights/ChartCard.tsx`（新增，共用卡片＋空狀態元件：`isEmpty` 為真時四個區塊顯示同一份文案與「前往寫日記」CTA，避免各區塊各自撰寫措辭不一致）
  - `src/pages/insights/ChartCard.module.css`（新增）
  - `src/pages/insights/InsightsPage.tsx`（新增，頁面容器：套用 S5 已核准變體 C「側邊摘要＋主圖表區」版型——`<aside>` 放摘要卡（統計數字＋圓餅圖，圓餅圖本身留給 TASK-025），主區放情緒趨勢／紀錄月曆／關鍵字文字雲三張卡；有資料但對應圖表元件尚未實作時顯示「圖表元件將於後續任務卡加入」佔位文字，供 TASK-023～026 逐一取代）
  - `src/pages/insights/InsightsPage.module.css`（新增，含 mockup 原有的 860px 響應式斷點）
  - `src/pages/insights/InsightsPage.test.tsx`（新增，5 個測試：標題與四個卡片標題渲染、空狀態四區塊文案與 CTA 皆一致、CTA 導向寫日記頁、有資料時顯示真實統計數字且不出現 CTA、單篇資料邊界案例不會出錯）
  - `src/App.tsx`（把 `/dashboard` 路由從佔位用的 `DashboardPage` 換成新的 `InsightsPage`）
  - `src/pages/DashboardPage.tsx`（刪除，已由 `src/pages/insights/InsightsPage.tsx` 取代——這是原本的佔位頁面，內容只有「佔位頁面：夢境數據分析看板將在後續任務卡實作」）
- 決策摘要：
  - 版型直接套用已核准的 S5 變體 C mockup（`ai/artifacts/專案設置/mockups/page2-variant-c-sidebar.html`）：280px 側邊欄＋1fr 主區的 grid、卡片間距、圓角/陰影/字體全部對照 mockup 與 `design-system.md` 的 token，未自行另創版面。
  - `src/App.tsx` 與 `src/pages/DashboardPage.tsx` 嚴格來說不在任務卡「允許變更的檔案：src/pages/insights/**」清單內，但這是把新容器接上既有路由的必要最小改動（否則新頁面永遠不會被渲染），且改動範圍極小（換一行 import／一行路由 element、刪除純佔位檔案），評估後判斷屬於任務本身必要的一部分，非「不相關檔案」。
  - 4 個圖表區塊在「有資料」狀態下暫時顯示「圖表元件將於後續任務卡加入」佔位文字，而不是任何假資料或提前實作的圖表——這是刻意的骨架優先做法，與後端 Epic（TASK-016 先搭路由骨架、TASK-017 才接上真正的 Gemini 呼叫邏輯）採用同一套「先搭容器骨架、後續任務卡逐一填入實作」模式，避免這張卡的範圍蔓延進 TASK-023～026 各自負責的圖表邏輯。
  - 空狀態邏輯集中在共用的 `ChartCard` 元件裡（而非在 `InsightsPage.tsx` 裡四處複製貼上同一段文案），用元件層級保證「四個圖表區塊空狀態文案一致」這個驗收標準，不會因為之後有人改了其中一處文案而不同步。
  - CTA 按鈕用既有的 `useNavigate()`（react-router-dom）導回 `/`，沒有新增任何依賴或元件庫之外的東西；按鈕重用既有 `Button` component 的 `primary` variant。
- 設計系統對照：重用 `Card`、`Button`（primary variant）既有元件；token 全部沿用 `design-system.md`（`--font-family-hand`、`--font-size-*`、`--space-*`、`--radius-*`、`--shadow-card`、`--color-primary-*`、`--color-background` 等），未新增或修改任何 token，也沒有新做元件需要登記回元件庫 inventory。
- 執行過的指令：
  - `npx tsc --noEmit` → 通過。
  - `npx eslint .` → 通過。
  - `npx vitest run` → 通過（32 個測試檔案、178 個測試全數通過，含本卡新增的 11 個測試）。
  - `npx vite build` → 建置成功。
- 測試輸出：`Test Files  32 passed (32)` / `Tests  178 passed (178)`。
- 螢幕截圖：本次會話的 Browser pane 未被使用者開啟顯示（`computer screenshot` 回報 pane 未 compositing frames，無法截圖），改以 `get_page_text`／`read_page`／`javascript_tool` 對正在跑的真實 dev server（`http://localhost:5173/dashboard`）做結構化驗證：實際瀏覽器裡目前已有 1 篇真實 completed 紀錄（使用者先前測試留下的資料，日期 2026-08-14），頁面正確顯示「總完成篇數 1」「平均字數 24」「記錄天數 1」，四張卡片標題（摘要／情緒趨勢／紀錄月曆／關鍵字文字雲）皆正確渲染，且因為有資料所以沒有出現空狀態 CTA——與程式邏輯預期一致。空狀態（0 篇）情境因為會清空瀏覽器裡使用者的真實資料，沒有在真實瀏覽器裡測試，改以 `InsightsPage.test.tsx` 的自動化測試（隔離的 jsdom 環境）驗證，涵蓋四區塊文案一致、CTA 存在且可正確導頁。
- 已知限制：
  - 4 個圖表區塊目前是佔位文字，實際圖表要等 TASK-023（情緒趨勢折線圖）、TASK-024（紀錄月曆熱力圖）、TASK-025（情緒圓餅圖＋摘要卡數字，摘要卡的統計數字本卡已經做好，只差圓餅圖本身）、TASK-026（關鍵字文字雲）逐一接上。
  - 未做行動裝置版面的視覺截圖驗證（CSS 已包含 mockup 原有的 860px 響應式斷點，但沒有實際在窄螢幕下截圖確認）。
  - 「記錄天數」與「總完成篇數」在目前的儲存模型下必然相等（`dream-storage.ts` 以 date 為 key，一天最多一筆 completed 紀錄），程式碼裡有註解說明這個假設；若未來儲存模型改成一天可有多筆，這裡的邏輯已經是用 `Set` 正確計算天數、不需要修改。
- 後續任務：TASK-023（情緒趨勢折線圖）現在已解鎖，可以開始實作。
