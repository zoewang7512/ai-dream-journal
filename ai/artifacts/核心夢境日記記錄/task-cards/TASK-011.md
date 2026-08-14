# AI-Ready 任務卡

## Metadata

- 任務：新增與暫存當天夢境日記
- 上層規格：ai/artifacts/核心夢境日記記錄/feature-spec.md
- 上層 Epic：核心夢境日記記錄
- 上層 User Story：新增與暫存當天夢境日記
- 分軌：前端
- 前置任務（dependsOn）：TASK-010
- 狀態：完成
- 風險等級：低
- Agent owner：Claude Code
- 人工核准者：zoewang7512（2026-08-14，審核完成證據並驗收；審核期間要求移除 debounce 自動暫存，改為僅在點擊「存檔」時才寫入，已修正並重新驗證後核准）

## 目標

讓使用者在今日撰寫畫面輸入、暫存、重複編輯當天日記內容，直到標記完成前都可修改。

## 情境包（Context Pack）

- 相關檔案：
  - src/pages/journal/TodayEntryEditor.tsx
- 既有模式：
  - 使用 S4 元件庫的 input/textarea 元件；沿用 dream-storage 的 create/update
- 假設：
  - 內容長度上限 2000 字，超過時前端即時提示並阻擋繼續輸入或送出
- 未知事項：
  - 無
- 允許變更的檔案：
  - src/pages/journal/**
- 不得觸碰：
  - 不得允許對非當天日期的資料寫入

## 需求

- 當天無紀錄時顯示空白撰寫畫面；已有 draft 時載入既有內容。
- 輸入內容即時或手動觸發暫存寫入 LocalStorage（status=draft）。
- 空白內容不可觸發「完成」（由本卡提供防呆，實際完成流程於下一張卡）。

## 驗收標準

- 重新整理頁面後，暫存內容仍存在。
- 超過長度上限時有明確提示。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：編輯器狀態與暫存邏輯測試
- 整合測試：與 dream-storage 的寫入整合測試
- E2E 測試：新增→暫存→重新整理仍保留內容
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：撰寫中畫面截圖
- 安全性檢查：無

## 完成證據

- 變更的檔案：
  - `src/pages/journal/TodayEntryEditor.tsx`（新增，今日撰寫編輯器：受控 Textarea＋僅在點擊「存檔」時才寫入 LocalStorage，輸入過程不做任何自動背景寫入）
  - `src/pages/journal/TodayEntryEditor.module.css`（新增，`actions` 列樣式，沿用既有 token）
  - `src/pages/journal/TodayEntryEditor.test.tsx`（新增，5 個單元/整合測試）
  - `src/pages/journal/JournalPage.tsx`（更新，`mode==='today-editing'` 時改渲染 `TodayEntryEditor` 取代原本 TASK-010 的靜態 placeholder 文字）
  - `src/pages/journal/JournalPage.module.css`（更新，移除因改用 `TodayEntryEditor` 而不再使用的 `.placeholderText`）
  - `src/pages/journal/JournalPage.test.tsx`（更新，第一個測試改用 `getByRole("textbox")` 搭配 `placeholder` 屬性斷言取代原本比對純文字節點；新增一個「點擊存檔→卸載→重新掛載模擬重新整理仍保留暫存內容」的整合測試）
- 決策摘要：
  - 暫存策略**僅**在使用者點擊「存檔」按鈕時才寫入 LocalStorage；輸入過程中不做任何 debounce 或背景自動寫入（原本實作了 600ms debounce 自動暫存，人工審核後明確要求移除：使用者沒有主動按下存檔前，系統不應該幫忙記錄）。`content` 只存在於元件的 React state，直到「存檔」被點擊才落地。
  - 是否已有底層紀錄用內部 `hasStoredRecordRef`（初始值取自傳入的 `record` prop 是否存在）判斷要呼叫 `dream-storage` 的 `create` 或 `update`，避免對同一天重複 `create` 觸發 `DUPLICATE_DATE` 錯誤；`date` prop 固定為 `JournalPage` 傳入的今日日期，元件本身不接受其他日期，結構上滿足「不得允許對非當天日期的資料寫入」的限制。
  - 字數上限 2000 字：直接重用既有 `Textarea` 元件的 `maxLength`＋`showCount` 能力（瀏覽器原生 `maxlength` 屬性會阻擋繼續輸入，字數統計即時顯示「已用/上限」提供明確提示），未新增任何自訂驗證邏輯，符合「重用既有元件」原則。
  - 「完成」「刪除」按鈕刻意不在本卡加入（分別是 TASK-012、TASK-015 的範圍），`.actions` 目前只靠右對齊放「存檔」一顆按鈕；後續卡片會在同一個 actions 列補上其餘按鈕並視需要調整 `justify-content`。
- 設計系統對照：
  - 重用的元件：`Textarea`（含 maxLength/showCount）、`Button`（ghost）。
  - 重用的 token：`space-8`、`space-12`（`TodayEntryEditor.module.css` 的 `actions` 間距）。未新增元件，元件庫 inventory 無需更動。
- 執行過的指令：
  - `npx tsc --noEmit` → 通過。
  - `npx eslint .` → 通過。
  - `npx vitest run` → 通過（18 個測試檔案、67 個測試全數通過，含本卡新增/調整後的 5 個測試）。
  - `npx vite build` → 建置成功（`dist/assets/index-*.js` 188.43 kB）。
- 測試輸出：`Test Files  18 passed (18)` / `Tests  67 passed (67)`。
- 螢幕截圖：
  - 同 TASK-010 的環境限制，`computer screenshot` 本次會話持續回報「pane 未顯示」逾時，未能附上像素級截圖。改用瀏覽器實機操作＋結構化驗證：
    1. 清空 LocalStorage 後開啟頁面，`read_page` 確認渲染出 `textbox`（`placeholder="今天的夢還記得嗎？寫下來吧。"`）與「存檔」按鈕。
    2. 實際在 Browser pane 輸入「還沒按存檔的內容」，等待 1 秒後讀取 `window.localStorage.getItem("ai-dream-journal:dreams")` 確認為 `null`——驗證未點擊存檔前不會有任何背景寫入。
    3. 點擊「存檔」按鈕後再次讀取，確認已寫入 `status:"draft"` 且內容與輸入完全相符。
    4. 重新導覽（模擬重新整理）後，`document.querySelector('textarea').value` 確認已存檔的內容原封不動載入，驗證「重新整理頁面後暫存內容仍存在」的驗收標準（僅適用於已按過存檔的內容）。
  - 已知限制：未附像素級截圖圖片檔案；如需視覺截圖建議待工具穩定後補拍，或請使用者於本機 `npm run dev:web` 直接查看。
- 安全性檢查：無（純前端 LocalStorage 讀寫，未新增網路請求或密鑰處理）。
- 已知限制：
  - 未附像素級螢幕截圖（見上）。
  - 未點擊「存檔」前，內容只存在於瀏覽器分頁的 React state；若直接關閉分頁或重新整理，未存檔的輸入會遺失（此為人工明確要求的行為：使用者沒有主動按下存檔前，系統不應該幫忙記錄），未做任何自動暫存或 `beforeunload` 保護。
  - 「完成」「刪除」按鈕與其互動尚未加入（見上方決策摘要），畫面目前只有「存檔」一顆動作按鈕。
  - Review gates（架構／測試）尚待人工或對應 agent 審查確認；本卡風險等級為「低」，依 AGENTS.md 未強制要求架構/安全性審查，但仍待人工驗收。
- 後續任務：TASK-012（完成日記＋AI 生成確認 dialog，會在 `.actions` 補上「完成」按鈕並串接 AI 引擎）、TASK-015（刪除當天暫存，會在 `.actions` 補上「刪除」按鈕）皆可基於本卡的 `TodayEntryEditor` 擴充。
