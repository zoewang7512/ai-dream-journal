# AI-Ready 任務卡

## Metadata

- 任務：刪除當天未完成的日記
- 上層規格：ai/artifacts/核心夢境日記記錄/feature-spec.md
- 上層 Epic：核心夢境日記記錄
- 上層 User Story：刪除當天未完成的日記
- 分軌：前端
- 前置任務（dependsOn）：TASK-010、TASK-011
- 狀態：完成
- 風險等級：低
- Agent owner：Claude Code
- 人工核准者：zoewang7512（2026-08-14，審核完成證據並驗收）

## 目標

讓使用者可以刪除當天尚未標記完成的暫存日記，過去或已完成日記不提供刪除入口。

## 情境包（Context Pack）

- 相關檔案：
  - src/pages/journal/TodayEntryEditor.tsx
- 既有模式：
  - 沿用元件庫的確認 dialog 元件（可與完成確認共用底層 Dialog 元件，內容不同）
- 假設：
  - 無
- 未知事項：
  - 無
- 允許變更的檔案：
  - src/pages/journal/**
- 不得觸碰：
  - 不得允許刪除任何 status=completed 或非當天日期的紀錄

## 需求

- 刪除前顯示二次確認。
- 確認後從 LocalStorage 移除該篇並回到空白撰寫畫面。

## 驗收標準

- 僅當天 draft 狀態顯示刪除入口；已完成或過去日記皆無此入口。
- 刪除後重新整理頁面確認資料已移除。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：刪除邏輯與權限檢查測試
- 整合測試：與 dream-storage 的刪除整合測試
- E2E 測試：新增暫存→刪除→確認資料清空
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：刪除確認 dialog 截圖
- 安全性檢查：無

## 完成證據

- 變更的檔案：
  - `src/pages/journal/TodayEntryEditor.tsx`（更新，新增「刪除」入口＋刪除確認 Modal＋刪除後重置為空白編輯狀態）
  - `src/pages/journal/TodayEntryEditor.module.css`（更新，`.actions` 改為 `space-between`，新增 `.actionsGroup` 讓「存檔」在沒有「刪除」按鈕時仍靠右對齊）
  - `src/pages/journal/TodayEntryEditor.test.tsx`（更新，新增 5 個刪除相關測試：無入口/有入口/存檔後立即出現入口/取消保留資料/確認刪除並清空）
  - `src/pages/journal/JournalPage.test.tsx`（更新，新增「過去已完成紀錄無刪除入口」與「新增暫存→刪除→重新整理仍清空」兩個整合測試）
- 決策摘要：
  - `hasStoredRecord`（原本 TASK-011 用 `useRef` 記錄「是否已有底層紀錄」，本卡改為 `useState`）用來控制「刪除」按鈕是否出現：尚未儲存任何內容時不顯示刪除入口（沒有東西可刪），第一次點擊「存檔」後立即出現，符合「僅當天 draft 狀態顯示刪除入口」。
  - 「刪除」重用既有 `Modal` 元件（Radix Dialog，focus trap／Esc 關閉皆由 Radix 處理），標題與情境完全對應 `Modal.test.tsx` 既有範例（「刪除這篇日記？」）；確認後呼叫 `dream-storage.deleteByDate(date)`，並把本地 `content`／`hasStoredRecord` 重置回空白，讓畫面立即回到「今天的夢還記得嗎？寫下來吧。」的初始撰寫畫面，不需要重新整理頁面。
  - 「刪除」按鈕使用既有 `Button` 的 `danger`（實色）變體，而非原始 mockup（`page1-variant-b-spread.html`）裡的 `.btn-danger-ghost`（外框樣式）。原因：目前已登記在 `design-system.md` 元件庫 inventory 的 `Button` 只有 primary/ghost/danger 三種 variant，沒有「danger-ghost」這個第四種變體；為了不新增一個未經 S4 元件庫關卡核准、只給這一個按鈕用的一次性樣式，選擇直接重用既有的 `danger` 實色變體。視覺上與最初 mockup 的外框紅色按鈕略有差異（本卡改為實心紅底），但功能與可讀性（危險操作用醒目的實色紅）不受影響。若未來人工希望嚴格對齊 mockup 的外框樣式，建議另開一張小任務把「danger-ghost」正式補進 `Button` 元件並登記回 inventory，而不是在這裡就地新增一次性 CSS。
  - `.actions` 版面从原本 TASK-011 的 `justify-content: flex-end`（只有存檔一顆按鈕）改為 `justify-content: space-between`＋左側佔位 `<span />`：沒有刪除按鈕時用空 `<span />` 佔住左側，讓「存檔」在有無「刪除」按鈕兩種情況下都維持在右側，視覺不會因為刪除入口的出現/消失而跳動位置。
- 設計系統對照：
  - 重用的元件：`Modal`（含 title/description/actions）、`Button`（danger、ghost）。
  - 重用的 token：既有 `.actions`／`.actionsGroup` 沿用 `space-12`。未新增元件，元件庫 inventory 無需更動（`danger-ghost` variant 的取捨已於上方決策摘要說明）。
- 執行過的指令：
  - `npx tsc --noEmit` → 通過。
  - `npx eslint .` → 通過。
  - `npx vitest run` → 通過（19 個測試檔案、79 個測試全數通過，含本卡新增的 7 個測試）。
  - `npx vite build` → 建置成功（`dist/assets/index-*.js` 229.79 kB）。
- 測試輸出：`Test Files  19 passed (19)` / `Tests  79 passed (79)`。
- 螢幕截圖：Browser pane 截圖工具本輪正常運作，實際操作驗證完整流程：
  1. 清空 LocalStorage 開啟頁面 → 無刪除按鈕（尚無暫存內容）。
  2. 輸入文字並點擊「存檔」→ 畫面立即出現靠左的實色紅「刪除」按鈕，「存檔」維持靠右。
  3. 點擊「刪除」→ 彈出確認 Modal，標題「刪除這篇日記？」、說明文字「刪除後無法復原，今天的暫存內容將被清空。」、「取消」／「刪除」兩個動作按鈕，背景正確變暗（overlay）。
  4. 點擊 Modal 內的「刪除」→ Modal 關閉，畫面回到初始空白撰寫狀態（placeholder 文字、0/2000），無刪除按鈕；直接讀取 `localStorage.getItem("ai-dream-journal:dreams")` 確認已變成 `{}`，資料確實清空。
  - 已於本次 Browser pane session 中即時檢視確認，配色/圓角/陰影與既有元件庫一致。
- 安全性檢查：無（純前端 LocalStorage 讀寫，未新增網路請求或密鑰處理；刪除操作有二次確認防止誤觸）。
- 已知限制：
  - 「刪除」按鈕視覺為實色紅（重用既有 `danger` variant）而非原始 mockup 的外框紅（見上方決策摘要）；如需嚴格對齊 mockup 視覺，建議另開任務補一個 `danger-ghost` variant 並登記回元件庫。
  - Review gates（架構／測試）尚待人工或對應 agent 審查確認；本卡風險等級為「低」，依 AGENTS.md 未強制要求架構/安全性審查，但仍待人工驗收。
- 後續任務：核心夢境日記記錄 Epic 中僅剩 TASK-012（完成日記＋AI 生成，仍卡在 TASK-017/019 的 AI 引擎 Epic 未完成）與 TASK-014（檢視單篇夢境詳情唯讀，僅依賴已完成的 TASK-010/013，可視需要接續實作）尚未完成。
