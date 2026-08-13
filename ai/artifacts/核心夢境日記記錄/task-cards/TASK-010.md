# AI-Ready 任務卡

## Metadata

- 任務：核心夢境日記記錄：架構基礎（頁面容器與瀏覽狀態）
- 上層規格：ai/artifacts/核心夢境日記記錄/feature-spec.md
- 上層 Epic：核心夢境日記記錄
- 上層 User Story：新增與暫存當天夢境日記
- 分軌：前端
- 前置任務（dependsOn）：TASK-001、TASK-002、TASK-003、TASK-004、TASK-005、TASK-006、TASK-007、TASK-008、TASK-009
- 狀態：實作完成，待人工驗收
- 風險等級：低
- Agent owner：Claude Code
- 人工核准者：待指派

## 目標

建立頁面一的共用容器：今日撰寫／翻頁瀏覽歷史兩種模式共用的 layout、路由/狀態切換與目前檢視日期的狀態管理，套用 S5 已核准版型。

## 情境包（Context Pack）

- 相關檔案：
  - src/pages/journal/JournalPage.tsx
  - src/pages/journal/useJournalViewState.ts（或等效狀態管理）
- 既有模式：
  - 沿用 design-system.md 的頁面一版型與元件庫 inventory
- 假設：
  - 頁面內以 client state 切換「今日撰寫」與「翻頁瀏覽」兩個子視圖，不需要額外路由套件
- 未知事項：
  - 無
- 允許變更的檔案：
  - src/pages/journal/**
- 不得觸碰：
  - 不得修改 AI 引擎或分析看板 Epic 的程式碼
  - 不得引入未登記在元件庫 inventory 的新元件（若缺元件需先補做並登記）

## 需求

- 建立可依「目前檢視日期」渲染今日撰寫或歷史唯讀畫面的容器。
- 容器需使用 src/lib/dream-storage.ts 讀寫資料。

## 驗收標準

- 容器可在今日撰寫與歷史瀏覽模式間正確切換，畫面與 S5 核准版型一致。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：視圖狀態切換邏輯測試
- 整合測試：與 dream-storage 的讀取整合測試
- E2E 測試：無（留待完整旅程於後續卡片驗證）
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：容器兩種模式截圖，比對 S5 版型
- 安全性檢查：無

## 完成證據

- 變更的檔案：
  - `src/pages/journal/JournalPage.tsx`（新增，頁面容器，依 `useJournalViewState` 的 `mode` 渲染 S5 核准的對頁跨頁版面）
  - `src/pages/journal/JournalPage.module.css`（新增，套用 `tokens.css` 既有 token，重現 `page1-variant-b-spread.html` 定案版面）
  - `src/pages/journal/useJournalViewState.ts`（新增，管理「目前檢視日期」狀態；由 today/歷史 completed 紀錄組成單一翻頁序列，衍生 `mode`／`canGoPrevious`／`canGoNext`）
  - `src/pages/journal/date.ts`（新增，日期字串與顯示格式輔助函式）
  - `src/pages/journal/JournalPage.test.tsx`、`useJournalViewState.test.ts`、`date.test.ts`（新增，單元＋整合測試）
  - `src/pages/JournalPage.tsx`（刪除，舊佔位頁面移至 `src/pages/journal/JournalPage.tsx`）
  - `src/App.tsx`（更新 import 路徑指向新的 `src/pages/journal/JournalPage`）
  - `src/App.test.tsx`（更新標題斷言為 S5 核准版面的 `夢境日記`，原本斷言的是 Nav 連結文字「寫日記/看日記」，與頁面 `<h1>` 文字混淆，改測 `<h1>` 實際文字）
- 決策摘要：
  - 本卡僅建置「架構基礎」：容器版面＋今日撰寫/歷史唯讀兩種模式的狀態切換，不含實際文字編輯、完成確認 dialog、刪除功能（分別留給 TASK-011/012/015）；`mode==='today-editing'` 時左頁只顯示靜態 placeholder 文字或既有 draft 內容預覽，不含可互動的輸入框，避免預先做出後續任務卡才該建的功能，也避免誤導使用者以為目前是可編輯狀態。
  - 翻頁序列（`useJournalViewState` 內的 `sequence`）以 `[今天, ...過去 completed 日期（新到舊）]` 組成，同時滿足 screen-spec 兩個邊界規則：今日未完成時序列索引恆為 0 → `canGoNext` 恆為 `false` → 容器直接不渲染「下一篇」按鈕（非僅 disabled）；已到最舊一篇時 `canGoPrevious` 為 `false` → 「上一篇」渲染但 disabled。完整的「上一篇/下一篇」互動細節（含空狀態文案、邊界行為的完整驗收）仍是 TASK-013（`HistoryNavigator.tsx`）的範圍，本卡的按鈕只是達成「容器可正確切換模式」驗收標準所需的最小可行版本，供 TASK-013 銜接／擴充。
  - 右頁 AI 分析／圖片區塊僅做最小可行呈現（mood+keywords 徽章、圖片或虛線 placeholder），完整唯讀詳情（含圖片載入失敗 fallback）留給 TASK-014（`EntryDetailReadonly.tsx`）。
- 設計系統對照：
  - 重用的 token：`color-grey-*`、`color-primary-*`、`color-success-*`、`font-family-hand`、`font-family-serif`、`font-size-*`、`font-weight-*`、`space-*`、`radius-lg/md/pill`、`shadow-card`。
  - 重用的元件：`Button`（ghost，翻頁）。左右頁容器因需要「僅左/右兩個角落圓角」的不對稱造型，與元件庫 `Card`（四角一致圓角）的視覺規格不同，故未直接使用 `Card` 元件本體，改為直接用 `radius-lg`／`shadow-card` token 在 CSS Module 手刻，未引入任何新的一次性數值；此手法與已核准的 `page1-variant-b-spread.html` mockup 實作方式一致。未新增任何元件，元件庫 inventory 無需更動。
- 執行過的指令：
  - `npx tsc --noEmit` → 通過，無錯誤。
  - `npx eslint .` → 通過，無錯誤。
  - `npx vitest run` → 通過（17 個測試檔案、61 個測試全數通過，含本卡新增的 3 個測試檔案）。
  - `npx vite build` → 建置成功（`dist/assets/index-*.js` 186.05 kB）。
- 測試輸出：`Test Files  17 passed (17)` / `Tests  61 passed (61)`。
- 螢幕截圖：
  - Browser pane 的 `computer screenshot` 本次會話持續回報「pane 未顯示、無法合成畫面」而逾時失敗，未能附上像素級截圖。改用 `get_page_text`／`read_page`（accessibility tree）＋直接讀取 `getComputedStyle` 逐一核對三個關鍵驗收點，皆與 S5 mockup 定案版面一致：
    1. **今日·未完成**（無資料時）：左頁徽章「撰寫中」＋今天日期＋placeholder「今天的夢還記得嗎？寫下來吧。」；右頁空白提示「完成今天的紀錄後，這裡會顯示 AI 分析與插圖。」；「← 上一篇」disabled；「下一篇 →」未渲染（非僅 disabled）。
    2. **歷史·已完成**：以 `localStorage` 種入一筆過去 completed 紀錄後點擊「上一篇」，左頁切換為徽章「已完成」＋該日日期＋唯讀文字；右頁顯示「AI 分析」標題＋mood/keywords 徽章＋圖片 placeholder；此時「上一篇」（已達最舊）disabled，「下一篇」enabled；點擊「下一篇」正確切回今日撰寫模式。
    3. **行動裝置版**（375×812）：`getComputedStyle` 確認 `.spread` 的 `grid-template-columns` 從桌面版雙欄變為單欄（`327px` 單一 track），對應 CSS Module 中 `@media (max-width: 800px)` 的堆疊規則已生效。
  - 已知限制：未能附上像素級截圖圖片檔案，僅有上述結構化驗證證據；若審查者需要實際視覺截圖，建議在螢幕截圖工具穩定後補拍，或請使用者於本機 `npm run dev:web` 開啟 http://localhost:5173 直接肉眼確認。
- 安全性檢查：無（純前端狀態管理與唯讀渲染，未新增任何網路請求、身分驗證或密鑰處理）。
- 已知限制：
  - 未附像素級螢幕截圖（見上）。
  - 今日撰寫模式的左頁僅為靜態預覽（無可輸入的 Textarea），實際編輯/暫存功能待 TASK-011 補上。
  - 翻頁按鈕目前直接內嵌於 `JournalPage.tsx`，尚未抽成獨立的 `HistoryNavigator.tsx`；TASK-013 可視需要重構抽出或直接沿用現有邏輯擴充空狀態文案等細節。
  - Review gates（架構／測試）尚待人工或對應 agent 審查確認；本卡風險等級為「低」，依 AGENTS.md 未強制要求架構/安全性審查，但仍待人工驗收。
- 後續任務：TASK-011（今日撰寫暫存編輯器）、TASK-012（完成日記＋AI 生成確認 dialog）、TASK-013（翻頁導覽元件化＋完整邊界/空狀態）、TASK-014（唯讀詳情元件化＋圖片 fallback）、TASK-015（刪除當天暫存）皆可基於本卡的容器與 `useJournalViewState` 開工。
