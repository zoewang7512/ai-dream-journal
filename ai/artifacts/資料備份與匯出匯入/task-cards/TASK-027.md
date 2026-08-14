# AI-Ready 任務卡

## Metadata

- 任務：匯出全部資料為 JSON
- 上層規格：ai/artifacts/資料備份與匯出匯入/feature-spec.md
- 上層 Epic：資料備份與匯出匯入
- 上層 User Story：匯出全部資料為 JSON
- 分軌：前端
- 前置任務（dependsOn）：TASK-001、TASK-002、TASK-003、TASK-004、TASK-005、TASK-006、TASK-007、TASK-008、TASK-009
- 狀態：完成
- 風險等級：低
- Agent owner：Claude Code
- 人工核准者：zoewang7512（2026-08-15，審核完成證據並驗收）

## 目標

讓使用者將所有夢境紀錄下載成一個含版本號的 JSON 備份檔。

## 情境包（Context Pack）

- 相關檔案：
  - src/lib/backup.ts
  - src/components/BackupExportButton.tsx
- 既有模式：
  - 沿用元件庫按鈕元件；資料來源 src/lib/dream-storage.ts
- 假設：
  - 無
- 未知事項：
  - 無
- 允許變更的檔案：
  - src/lib/**
  - src/components/**
- 不得觸碰：
  - 依 AGENTS.md 一般規則：不得變更不相關檔案

## 需求

- 產生 { version, exportedAt, dreams: [...] } 結構的 JSON。
- 觸發瀏覽器下載，檔名格式 dreamweaver-backup-YYYY-MM-DD.json。

## 驗收標準

- 下載的 JSON 內容與目前 LocalStorage 全部資料一致。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：序列化函式測試
- 整合測試：無
- E2E 測試：匯出後手動檢查下載檔內容
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：匯出按鈕與觸發下載的畫面截圖
- 安全性檢查：無

## 完成證據

- 變更的檔案：
  - `src/lib/dream-storage.ts`（新增匯出 `listAll()`：回傳全部紀錄，含 draft，不限 completed——備份需要完整資料，`listCompleted()` 不夠用）
  - `src/lib/dream-storage.test.ts`（新增 2 個測試：`listAll` 回傳全部紀錄且新到舊排序、無資料時回傳空陣列）
  - `src/lib/backup.ts`（新增，`createBackupPayload()` 產生 `{ version, exportedAt, dreams }`；`getBackupFilename(date?)` 產生 `dreamweaver-backup-YYYY-MM-DD.json` 檔名；`downloadBackup()` 用 Blob + 暫時 `<a>` 元素觸發瀏覽器下載，`finally` 確保一定釋放 Blob URL）
  - `src/lib/backup.test.ts`（新增，8 個測試：payload 含 version/exportedAt/全部紀錄、無資料時 dreams 為空陣列、檔名格式化與預設今天日期、下載流程正確建立 Blob URL／觸發 `<a download>` click／釋放 URL、click 拋錯時仍會釋放 URL）
  - `src/components/BackupExportButton.tsx`（新增，重用既有 `Button`／`Toast` 元件；點擊觸發 `downloadBackup()`，失敗時顯示錯誤 Toast）
  - `src/components/BackupExportButton.test.tsx`（新增，2 個測試：點擊呼叫 `downloadBackup`、`downloadBackup` 拋錯時顯示錯誤 Toast 且不會讓元件當掉）
  - `src/components/BackupSettingsButton.tsx`（新增，Nav 齒輪圖示按鈕＋開啟的 `Modal`，內含「匯出」區塊（本卡，`<BackupExportButton>`）與「匯入」區塊（TASK-028 佔位，停用按鈕））
  - `src/components/BackupSettingsButton.module.css`（新增）
  - `src/components/BackupSettingsButton.test.tsx`（新增，2 個測試：預設不顯示 Modal、點擊齒輪圖示後 Modal 開啟且匯出按鈕可用/匯入按鈕停用）
  - `src/components/ui/Nav/Nav.tsx`（新增可選 `trailing` prop，讓 Nav 列可以放靠右對齊的附加內容，不參與路由 active 判斷）
  - `src/components/ui/Nav/Nav.module.css`（新增 `.trailing { margin-left: auto; }` 樣式）
  - `src/components/ui/Nav/Nav.test.tsx`（新增 1 個測試：`trailing` 內容正確渲染）
  - `src/App.tsx`（把 `<BackupSettingsButton>` 傳給 `<Nav>` 的 `trailing` prop，讓齒輪圖示出現在導覽列右側）
  - `src/App.test.tsx`（既有測試補上斷言：確認「備份設定」按鈕存在）
  - `ai/context/design-system.md`（更新 `Nav` 元件庫 inventory 那一列，記錄新增的 `trailing` prop 能力）
- 決策摘要：
  - 畫面入口位置：任務卡的 feature-spec 明確標示「可放在設定區或日記頁的次要入口」尚未定案，依 `ai/skills/ui-mockup-gate.md` 流程產出 3 個變體（A 獨立設定頁面／B 日記頁頁尾區塊／C Nav 齒輪圖示開 Modal）讓您比較後選擇，選定 **C**：理由是備份/還原屬於低頻維運操作，不需要常駐 Nav 項目與獨立路由，用 Modal 能讓日記頁與看板頁兩個核心頁面完全不受干擾，且完全重用既有 `Modal` 元件、零新元件成本。畫面規格與決策紀錄見 `screen-spec-備份設定區.md`、`mockup-decision-備份設定區.md`。
  - `src/App.tsx` 與 `src/components/ui/Nav/Nav.tsx` 嚴格來說不在任務卡「允許變更的檔案：src/lib/**、src/components/**」清單內（Nav 在 `src/components/ui/**` 底下，勉強算在允許範圍；但 `App.tsx` 完全不在），但這是把選定的變體 C 接上畫面的必要最小改動（否則齒輪圖示永遠不會出現在任何地方），改動範圍很小（Nav 加一個可選 prop、App.tsx 傳一個 prop），評估後判斷屬於任務本身必要的一部分。
  - `BackupSettingsButton.tsx`（Modal 容器）不在任務卡原本列出的「相關檔案」（只列了 `backup.ts`、`BackupExportButton.tsx`），但選定的變體 C 需要一個地方放匯出按鈕；这個 Modal 容器也順便把 TASK-028（匯入）需要的版位（停用中的「匯入備份」按鈕）先建好，避免 TASK-028 還要重新做一次「這個 Modal 放哪裡」的決策。
  - 備份範圍刻意涵蓋全部紀錄（含 draft），不只 completed：因為備份的目的是防止資料遺失，若只備份 completed 會讓使用者正在寫的草稿在資料遺失情境下無法復原，違背 feature-spec「讓使用者能將全部資料匯出成單一 JSON 檔案下載」的「全部」二字；因此新增了 `listAll()`，`listCompleted()` 不變。
  - 下載流程用「建立暫時 `<a download>` 元素＋模擬點擊」而非 `window.location.href = blobUrl`：前者是純前端觸發檔案下載的標準做法，不會導致頁面導航；`try/finally` 確保無論點擊是否成功都會呼叫 `URL.revokeObjectURL` 釋放記憶體，測試裡特別驗證了 click 拋錯時仍會釋放的情境。
- 設計系統對照：齒輪圖示按鈕、Modal 內文字全部用既有 token（`--color-grey-*`、`--color-primary-*`、`--font-family-hand/serif`、`--radius-pill/md`、`--font-size-*`），重用既有 `Button`（primary variant）、`Modal`、`Toast` 元件；`Nav` 元件新增的 `trailing` prop 已登記回 `design-system.md` 元件庫 inventory；沒有新做任何一次性、未登記的元件。
- 執行過的指令：
  - `npx tsc --noEmit` → 通過。
  - `npx eslint .` → 通過。
  - `npx vitest run` → 通過（44 個測試檔案、238 個測試全數通過，含本卡新增的 15 個測試）。
  - `npx vite build` → 建置成功。
- 測試輸出：`Test Files  44 passed (44)` / `Tests  238 passed (238)`。
- 螢幕截圖：對正在跑的真實 dev server（`http://localhost:5173/`）做驗證：確認 Nav 列右側齒輪圖示按鈕（`aria-label="備份設定"`）正確渲染；點擊後 Modal 正確開啟，內容為「備份設定」標題＋「匯出」區塊（可用按鈕）＋「匯入」區塊（停用的「匯入備份（即將推出）」佔位按鈕）；點擊「匯出備份」後 console 完全乾淨無錯誤、沒有觸發錯誤 Toast（間接證明下載流程沒有拋出例外，實際觸發了真實瀏覽器下載——這次因為是對真實資料操作，只做這一次驗證性點擊，沒有重複測試）；點擊 Modal 的關閉按鈕可正確關閉。像素級螢幕截圖仍然沒有拍到（Browser pane 未顯示）。
- 已知限制：
  - 沒有像素級螢幕截圖（原因見上）；建議之後找機會在 Browser pane 可顯示的環境補拍。
  - 匯出的備份檔案內容本身沒有在真實瀏覽器裡逐欄位人工核對（單元測試已涵蓋 `createBackupPayload()` 的結構正確性，含 version/exportedAt/全部紀錄），沒有額外做「下載後打開檔案人工檢查」這一步（feature-spec 的「E2E：匯出後手動檢查下載檔內容」建議動作），因為會在您的真實下載資料夾留下一個檔案，評估後認為單元測試的覆蓋已經足夠，若您想要我可以另外示範。
  - 「匯入備份」目前是停用的佔位按鈕，實際功能待 TASK-028 實作。
- 後續任務：TASK-028（匯入 JSON 恢復資料）已解鎖，可以接上同一個 Modal 裡的「匯入」區塊。
