# AI-Ready 任務卡

## Metadata

- 任務：翻頁瀏覽歷史夢境
- 上層規格：ai/artifacts/核心夢境日記記錄/feature-spec.md
- 上層 Epic：核心夢境日記記錄
- 上層 User Story：翻頁瀏覽歷史夢境
- 分軌：前端
- 前置任務（dependsOn）：TASK-010
- 狀態：完成
- 風險等級：低
- Agent owner：Claude Code
- 人工核准者：zoewang7512（2026-08-14，審核完成證據並驗收）

## 目標

提供上一篇/下一篇導覽，讓使用者以翻頁方式依日期順序瀏覽已完成的過去紀錄。

## 情境包（Context Pack）

- 相關檔案：
  - src/pages/journal/HistoryNavigator.tsx
- 既有模式：
  - 沿用元件庫的按鈕元件；資料來源為 dream-storage 的 listCompleted
- 假設：
  - 無
- 未知事項：
  - 無
- 允許變更的檔案：
  - src/pages/journal/**
- 不得觸碰：
  - 依 AGENTS.md 一般規則：不得變更不相關檔案

## 需求

- 依日期排序列出所有 completed 紀錄，提供上一篇/下一篇切換。
- 到達最早/最新紀錄時對應方向按鈕停用。
- 完全沒有歷史紀錄時顯示空狀態引導。

## 驗收標準

- 導覽在有資料、邊界、無資料三種情況下行為正確。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：導覽索引計算邏輯測試
- 整合測試：與 dream-storage 的讀取整合測試
- E2E 測試：無（併入下一張詳情卡的 E2E）
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：有紀錄/邊界/空狀態三種截圖
- 安全性檢查：無

## 完成證據

- 變更的檔案：
  - `src/pages/journal/HistoryNavigator.tsx`（新增，把 TASK-010 內嵌在 `JournalPage` 的「上一篇/下一篇」按鈕抽成獨立元件；純呈現邏輯，依 `visible`/`disabled`/`onNavigate` props 決定要不要渲染、要不要停用）
  - `src/pages/journal/HistoryNavigator.test.tsx`（新增，3 個單元測試：可點擊、disabled、`visible=false` 時不渲染）
  - `src/pages/journal/useJournalViewState.ts`（更新，新增 `hasHistory` 欄位：`sequence.length > 1`，供空狀態文案判斷使用）
  - `src/pages/journal/useJournalViewState.test.ts`（更新，新增 `hasHistory` 相關斷言，以及一個「3 筆歷史紀錄依新到舊翻頁、每個邊界都正確 disable/enable」的多筆導覽測試）
  - `src/pages/journal/JournalPage.tsx`（更新，改用 `HistoryNavigator` 取代原本內嵌的兩顆按鈕；今日撰寫模式下若 `!hasHistory` 額外顯示空狀態引導文字）
  - `src/pages/journal/JournalPage.module.css`（更新，新增 `.rightBlankHint` 樣式）
  - `src/pages/journal/JournalPage.test.tsx`（更新，新增空狀態提示文字的顯示/不顯示斷言）
- 決策摘要：
  - 導覽的索引/邊界計算邏輯本來就已經在 TASK-010 的 `useJournalViewState` 裡完成（見該卡完成證據的說明：「本卡的按鈕只是達成容器可正確切換模式的最小可行版本，供 TASK-013 銜接/擴充」），所以本卡不重複實作演算法，只做兩件事：①把按鈕渲染抽成獨立、可測試的 `HistoryNavigator` 元件；②補上先前缺的「完全沒有歷史紀錄」空狀態文案與更完整的多筆歷史導覽測試覆蓋率。
  - `HistoryNavigator` 用 `direction`（previous/next）+ `visible`/`disabled`/`onNavigate` 的簡單 props 介面，`visible=false` 時直接回傳 `null`（對應「今日/未完成時下一篇直接不渲染，非僅 disabled」的驗收要求）；`JournalPage` 分別在左頁與右頁的頁角各放一個 `HistoryNavigator` 實例。
  - 空狀態文案「還沒有翻頁可看的舊日記，完成今天的第一篇吧。」依 `screen-spec-頁面一日記頁.md` 的空狀態表格逐字採用，顯示在右頁既有空白提示文字下方（`hasHistory` 為 false 時才出現）。
- 設計系統對照：
  - 重用的元件：`Button`（ghost，`HistoryNavigator` 內部直接重用，未新增元件）。
  - 重用的 token：`font-size-14`、`color-text-tertiary`、`space-8`（`.rightBlankHint` 樣式）。元件庫 inventory 無需更動。
- 執行過的指令：
  - `npx tsc --noEmit` → 通過。
  - `npx eslint .` → 通過。
  - `npx vitest run` → 通過（19 個測試檔案、72 個測試全數通過，含本卡新增/調整的測試）。
  - `npx vite build` → 建置成功（`dist/assets/index-*.js` 188.82 kB）。
- 測試輸出：`Test Files  19 passed (19)` / `Tests  72 passed (72)`。
- 螢幕截圖：本輪 Browser pane 的 `computer screenshot` 恢復正常，實際截圖驗證三種情況：
  1. **無資料（空狀態）**：清空 LocalStorage 後開啟頁面，右頁空白提示下方正確顯示「還沒有翻頁可看的舊日記，完成今天的第一篇吧。」，「← 上一篇」disabled、無「下一篇」按鈕。
  2. **邊界（僅一筆歷史）**：種入一筆過去 completed 紀錄，點擊「上一篇」切到該篇，畫面正確顯示徽章「已完成」、唯讀文字、AI 分析關鍵字、圖片 placeholder；此時「上一篇」disabled（已是最舊）、「下一篇」enabled（可翻回今日）。
  3. **有資料（多筆）**：種入三筆過去 completed 紀錄（2026-08-08／08-10／08-12），從今日連續點擊「上一篇」三次，依序正確顯示 08-12 → 08-10 → 08-08（新到舊排序無誤），第三次到達最舊一篇後「上一篇」disabled、「下一篇」仍 enabled。
  - 截圖已在本次 Browser pane session 中檢視確認，畫面配色、圓角、陰影、字體皆與 S5 核准版型一致；未額外匯出成獨立圖片檔案。
- 安全性檢查：無（純前端狀態切換與唯讀渲染，無新增網路請求或密鑰處理）。
- 已知限制：
  - `HistoryNavigator` 目前只負責渲染，索引/邊界計算仍留在 `useJournalViewState`（見決策摘要），未來若導覽邏輯變複雜，可考慮把該邏輯抽成獨立 hook。
  - Review gates（架構／測試）尚待人工或對應 agent 審查確認；本卡風險等級為「低」，依 AGENTS.md 未強制要求架構/安全性審查，但仍待人工驗收。
- 後續任務：TASK-014（檢視單篇夢境詳情，唯讀）可基於本卡已驗證過的翻頁導覽與 `useJournalViewState` 繼續擴充唯讀詳情呈現與圖片載入失敗 fallback。
