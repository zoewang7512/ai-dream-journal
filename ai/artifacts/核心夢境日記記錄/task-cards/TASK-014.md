# AI-Ready 任務卡

## Metadata

- 任務：檢視單篇夢境詳情（唯讀）
- 上層規格：ai/artifacts/核心夢境日記記錄/feature-spec.md
- 上層 Epic：核心夢境日記記錄
- 上層 User Story：檢視單篇夢境詳情（唯讀）
- 分軌：前端
- 前置任務（dependsOn）：TASK-010、TASK-013
- 狀態：完成
- 風險等級：低
- Agent owner：Claude Code
- 人工核准者：zoewang7512（2026-08-14，審核完成證據並驗收）

## 目標

在翻頁瀏覽的容器內，顯示目前選中日期的完整日記內容、AI 分析結果與生成圖片，全程唯讀。

## 情境包（Context Pack）

- 相關檔案：
  - src/pages/journal/EntryDetailReadonly.tsx
- 既有模式：
  - 沿用元件庫的 card 元件；圖片以 Epic2 提供的 URL 組裝結果顯示
- 假設：
  - 無
- 未知事項：
  - 無
- 允許變更的檔案：
  - src/pages/journal/**
- 不得觸碰：
  - 不得提供任何編輯或刪除操作入口

## 需求

- 顯示原始文字、mood/keywords、生成圖片。
- 畫面不含任何可變更資料的互動元件。

## 驗收標準

- 過去任一篇紀錄皆可正確顯示且找不到編輯/刪除按鈕。
- 圖片載入失敗時有合理的 fallback（如替代文字），不造成版面崩壞。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：詳情渲染的單元測試
- 整合測試：無
- E2E 測試：翻頁→檢視詳情的完整旅程
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：詳情畫面（含圖片載入失敗 fallback）截圖
- 安全性檢查：無

## 完成證據

- 變更的檔案：
  - `src/pages/journal/EntryDetailReadonly.tsx`（新增，把 TASK-010 內嵌在 `JournalPage` 的唯讀左頁文字／右頁 AI 分析與圖片渲染抽成獨立元件；新增圖片載入失敗 fallback）
  - `src/pages/journal/EntryDetailReadonly.module.css`（新增，把原本散落在 `JournalPage.module.css` 的 `readonlyText`／`analysisTitle`／`keywordRow`／`keyword`／`image`／`imagePlaceholder` 樣式搬過來）
  - `src/pages/journal/EntryDetailReadonly.test.tsx`（新增，5 個單元測試：文字唯讀無互動元件、分析+圖片唯讀無互動元件、無圖片時的等待中 placeholder、圖片載入失敗 fallback、無紀錄時的防呆渲染）
  - `src/pages/journal/JournalPage.tsx`（更新，改用 `<EntryDetailReadonly part="text" .../>` 與 `<EntryDetailReadonly part="analysis" .../>` 取代原本內嵌的唯讀渲染，並用 `key={viewDate}` 讓每次翻頁都重新掛載，避免圖片載入失敗的狀態跨紀錄殘留）
  - `src/pages/journal/JournalPage.module.css`（更新，移除已搬到 `EntryDetailReadonly.module.css` 的樣式）
  - `src/pages/journal/JournalPage.test.tsx`（更新，把「翻頁瀏覽歷史」測試強化為完整旅程：加入圖片 URL 斷言、明確斷言唯讀畫面沒有任何 `textbox`／「刪除」／「存檔」按鈕）
- 決策摘要：
  - 沿用 TASK-013（`HistoryNavigator`）建立的抽取模式：唯讀渲染邏輯本來就已經在 TASK-010 的 `JournalPage` 裡跑得好好的，本卡的重點不是重寫渲染邏輯，而是①抽成獨立、可獨立測試的 `EntryDetailReadonly` 元件；②補上先前一直缺的圖片載入失敗 fallback（TASK-010 的完成證據當時就已註記這個缺口留給本卡）。
  - `EntryDetailReadonly` 用 `part`（"text" | "analysis"）決定要渲染左頁文字還是右頁分析＋圖片，呼應 `HistoryNavigator` 的 `direction` prop 設計慣例，讓兩個獨立呈現位置共用同一個元件檔案。
  - 圖片載入失敗偵測：`<img>` 的 `onError` 觸發後把內部 `imageFailed` state 設為 `true`，改渲染既有的虛線 `imagePlaceholder` 樣式＋「圖片載入失敗，請稍後再試」文字，不留下瀏覽器預設的破圖示，也不撐爆版面（placeholder 的 `aspect-ratio: 4/3` 與正常圖片一致）。`JournalPage` 在渲染 `EntryDetailReadonly` 時加上 `key={viewDate}`，翻頁到不同日期時元件會整個重新掛載、`imageFailed` 自動歸零，避免「上一篇圖片失敗過」誤判到「這一篇圖片也失敗」。
  - 驗收標準「找不到編輯/刪除按鈕」在架構上本來就成立（`EntryDetailReadonly` 只會在 `mode==='readonly'` 時渲染，`TodayEntryEditor`／刪除功能只存在於 `mode==='today-editing'` 分支），本卡額外在 `EntryDetailReadonly.test.tsx` 與 `JournalPage.test.tsx` 補上明確斷言（`queryByRole("button")`／`queryByRole("textbox")` 皆為空）讓這個約束有測試覆蓋，而不只是隱含在元件結構裡。
- 設計系統對照：
  - 樣式全部搬自既有 `JournalPage.module.css`（本來就是 S5 核准版型的一部分），未新增任何 token 或元件，元件庫 inventory 無需更動。
- 執行過的指令：
  - `npx tsc --noEmit` → 通過。
  - `npx eslint .` → 通過。
  - `npx vitest run` → 通過（20 個測試檔案、84 個測試全數通過，含本卡新增/調整的測試）。
  - `npx vite build` → 建置成功（`dist/assets/index-*.js` 230.03 kB）。
- 測試輸出：`Test Files  20 passed (20)` / `Tests  84 passed (84)`。
- 螢幕截圖：Browser pane 截圖工具本輪正常，實際操作驗證：
  1. 種入一筆過去 completed 紀錄（含正常 `imageUrl`）並點擊「上一篇」，畫面正確顯示唯讀文字、mood/keywords 徽章、AI 生成圖片。
  2. 種入一筆 `imageUrl` 指向不存在網域的紀錄，點擊「上一篇」後圖片載入失敗，正確 fallback 為虛線框＋「圖片載入失敗，請稍後再試」文字，版面沒有崩壞（維持與正常圖片相同的 4:3 區塊大小），`get_page_text` 確認畫面文字內容完全符合預期。
  - 已於本次 Browser pane session 中即時檢視確認。
- 安全性檢查：無（純前端唯讀渲染，`imageUrl` 直接來自本機 LocalStorage 資料，未新增網路請求邏輯；`<img>` 載入失敗屬正常瀏覽器行為，非安全性風險）。
- 已知限制：
  - Review gates（架構／測試）尚待人工或對應 agent 審查確認；本卡風險等級為「低」，依 AGENTS.md 未強制要求架構/安全性審查，但仍待人工驗收。
- 後續任務：核心夢境日記記錄 Epic 目前僅剩 TASK-012（完成日記＋AI 生成確認 dialog）尚未完成，仍卡在「AI 夢境分析與圖像生成引擎」Epic 的 TASK-017／TASK-019 未開工；待該 Epic 補完後即可回頭做 TASK-012，屆時「核心夢境日記記錄」Epic 即全數完成。
