# AI-Ready 任務卡

## Metadata

- 任務：匯入 JSON 恢復資料（含格式驗證與錯誤提示）
- 上層規格：ai/artifacts/資料備份與匯出匯入/feature-spec.md
- 上層 Epic：資料備份與匯出匯入
- 上層 User Story：匯入 JSON 恢復資料
- 分軌：前端
- 前置任務（dependsOn）：TASK-027
- 狀態：完成
- 風險等級：中
- Agent owner：Claude Code
- 人工核准者：zoewang7512（2026-08-15，審核完成證據並驗收）

## 目標

讓使用者上傳備份 JSON 檔整批覆蓋 LocalStorage 資料，並在格式錯誤時給予清楚提示且不寫入任何資料。

## 情境包（Context Pack）

- 相關檔案：
  - src/lib/backup.ts
  - src/components/BackupImportButton.tsx
- 既有模式：
  - 沿用 TASK-027 的備份格式；使用 File API 讀取上傳檔案
- 假設：
  - 採整批覆蓋策略，不做逐筆合併（已於 feature-spec 記錄核准）
- 未知事項：
  - 無
- 允許變更的檔案：
  - src/lib/**
  - src/components/**
- 不得觸碰：
  - 不得實作逐筆合併/去重邏輯（超出本卡範圍）

## 需求

- 選擇檔案後先顯示「將覆蓋目前所有資料」確認提示，取消則不執行任何寫入。
- 確認後解析 JSON：parse 失敗、version 缺失或不支援、dreams 非陣列或欄位不符，皆需回傳對應錯誤訊息且不修改現有 LocalStorage（全有或全無）。
- 成功時整批覆蓋 LocalStorage 並更新畫面。

## 驗收標準

- 合法備份檔可成功匯入還原並與原始匯出內容一致（round-trip）。
- 三種格式錯誤情境（非 JSON、缺欄位、版本不支援）皆有清楚錯誤訊息且不破壞現有資料。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：匯入驗證與反序列化函式測試（含壞資料邊界情況）
- 整合測試：匯出→清空→匯入的 round-trip 整合測試
- E2E 測試：使用者操作匯出下載→匯入同檔案→資料一致
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：匯入確認/成功/失敗三種狀態截圖
- 安全性檢查：匯入內容若渲染於畫面需確認已適當跳脫，避免 XSS

## 完成證據

- 變更的檔案：
  - `src/lib/backup.ts`（新增匯入邏輯：`BackupImportError`（含 `reason`：`invalid_json`／`missing_version`／`unsupported_version`／`invalid_shape`）、`parseBackupFile(text)` 解析並驗證備份檔文字內容——任何一個環節不符就直接 throw，不回傳部分結果，確保後續寫入是全有或全無；內部逐欄位驗證每筆 `DreamRecord`（id/date 格式/content/status 列舉/createdAt 必要，analysis/imageUrl/completedAt 選填但格式需正確））
  - `src/lib/dream-storage.ts`（新增 `replaceAll(records)`：整批覆蓋 LocalStorage，取代原本全部內容，本身是單次 `writeAll`，天生全有或全無）
  - `src/lib/backup.test.ts`（新增 12 個測試：真實 payload round-trip 解析成功、選填欄位可省略、invalid_json／missing_version／unsupported_version／dreams 非陣列／缺欄位／日期格式錯／status 不合法／analysis 格式錯 各自對應錯誤、解析失敗不影響現有資料、**匯出→清空→匯入的完整 round-trip 整合測試**）
  - `src/lib/dream-storage.test.ts`（新增 3 個 `replaceAll` 測試：整批取代而非合併、清空、寫入失敗時拋 STORAGE_FULL）
  - `src/components/BackupImportButton.tsx`（新增，狀態機：選檔案 → 顯示「將覆蓋所有資料」確認 Modal（列出檔名）→ 確認後解析驗證＋整批覆蓋 LocalStorage → 成功後 `window.location.reload()`；驗證失敗顯示對應錯誤 Toast 且不寫入任何資料；取消則不執行任何動作）
  - `src/components/BackupImportButton.test.tsx`（新增 6 個測試：預設無確認對話框、選檔後顯示含檔名的確認對話框、取消不寫入、成功匯入覆蓋資料並觸發 reload、無效 JSON 顯示對應錯誤且不觸資料、不支援版本顯示對應錯誤且不觸資料）
  - `src/components/BackupSettingsButton.tsx`（把「匯入」區塊的停用佔位按鈕換成真正的 `<BackupImportButton>`）
  - `src/components/BackupSettingsButton.module.css`（移除不再使用的 `.disabledButton` 樣式）
  - `src/components/BackupSettingsButton.test.tsx`（既有測試更新：斷言匯入按鈕現在是「可用」而非「停用佔位」）
  - `vitest.setup.ts`（新增 `Blob.prototype.text()` polyfill——這個專案的 jsdom 版本沒有實作 `File`/`Blob.prototype.text()`，用 `FileReader` 補上，比照檔案裡既有的 jsdom 缺口 polyfill 慣例）
- 決策摘要：
  - 「確認覆蓋」用巢狀 `Modal`（在 TASK-027 已開啟的「備份設定」Modal 之上再疊一層），而非另外設計一個獨立的中介畫面：Radix Dialog 原生支援疊加多層對話框（各自獨立管理 overlay/focus trap），實測（見下方螢幕截圖記錄）兩層 Modal 可以正確同時開啟、各自正確顯示內容，不需要額外處理；比照既有 `CompleteEntryDialog.tsx` 的 Modal 使用慣例（同一個 `Modal` 元件，不同觸發情境）。
  - 「畫面即時反映新資料」（feature-spec 明訂）用 `window.location.reload()` 整頁重新整理達成，而非設計一套跨頁面（日記頁／看板頁）的資料同步機制：專案目前沒有全域狀態管理，每個頁面都是掛載時直接讀 LocalStorage，整批覆蓋這種「资料徹底換掉」的操作用整頁重新整理最簡單可靠，也最誠實（不會有「某個畫面忘記訂閱更新」的殘留 bug 風險）；重新整理後所有頁面自然用新資料重新初始化。
  - 驗證用「先確認、後解析」的順序（不是先解析驗證再問使用者）：直接對應 feature-spec 的功能需求逐字描述「WHEN 使用者選擇檔案匯入 THE SYSTEM SHALL 先顯示...確認提示，取消則不執行任何寫入」——確認提示在解析之前出現，取消後連解析都不會做。
  - 沒有做逐欄位合併或部分匯入：明確依 feature-spec 已核准的「整批覆蓋」策略與本卡「不得觸碰」清單（不得實作逐筆合併/去重邏輯），`replaceAll` 直接整批取代。
  - XSS 安全檢查：`grep -rn dangerouslySetInnerHTML src/` 確認整個前端沒有任何 raw HTML 渲染路徑，`record.content`／`analysis.keywords` 等匯入內容一律經過 React JSX 預設跳脫（`{content}`），不會有 script injection 風險；`imageUrl` 目前只驗證是字串型別，沒有額外限制網址格式——`<img src>` 在現代瀏覽器不會執行 `javascript:` 等協定的程式碼，最壞情況只是圖片載入失敗或觸發一次對任意網址的 GET 請求，已記錄於下方已知限制。
- 設計系統對照：重用既有 `Button`（ghost/danger variant）、`Modal`、`Toast` 元件，未新增樣式或 token；沒有新做元件。
- 執行過的指令：
  - `npx tsc --noEmit` → 通過。
  - `npx eslint .` → 通過。
  - `npx vitest run` → 通過（45 個測試檔案、259 個測試全數通過，含本卡新增的 21 個測試）。
  - `npx vite build` → 建置成功。
- 測試輸出：`Test Files  45 passed (45)` / `Tests  259 passed (259)`。
- 螢幕截圖：這次做了真正的端到端即時驗證（不只是結構檢查）：對正在跑的真實 dev server（`http://localhost:5173/`），用您瀏覽器裡「真實現有資料」組出一份備份 JSON（等於原地做一次安全的 round-trip，不會造成資料遺失），模擬選檔觸發匯入流程，確認：
  1. 兩層 Modal 正確同時顯示（外層「備份設定」＋內層「確定要匯入嗎？」，內層正確列出檔名 `safe-roundtrip-backup.json` 與警告文字）。
  2. 點擊「確定覆蓋匯入」後，LocalStorage 內容逐欄位比對（id/date/content/status/analysis/imageUrl/createdAt/completedAt）與匯入前完全一致。
  3. 頁面確實觸發了真正的瀏覽器重新整理（`document.readyState` 回到 `complete`、console 歷史被清空重置）。
  4. console 全程無任何錯誤。
  像素級螢幕截圖仍然沒有拍到（Browser pane 未顯示）。
- 已知限制：
  - 沒有像素級螢幕截圖（原因見上）；建議之後找機會在 Browser pane 可顯示的環境補拍。
  - `imageUrl` 欄位只驗證型別是字串，沒有限制網址格式／協定；已在決策摘要說明這不構成 XSS 風險（`<img src>` 不會執行程式碼），但如果之後想更嚴謹，可以額外驗證是否符合預期的 `/api/dream-image?...` 格式。
  - 記憶體內驗證邏輯目前只檢查最上層必要欄位型別是否正確，沒有做更深的語意驗證（例如 `date` 是否為合法存在的日期如 2月30日、`seed` 是否在 Pollinations 允許的範圍內）；備份檔本來就是由本應用自己匯出的，這類語意錯誤不會自然發生，只有手動竄改檔案才會遇到，屬於刻意的最小驗證範圍。
- 後續任務：「資料備份與匯出匯入」Epic 兩張卡（TASK-027、028）全數完成，Epic 主線結束。
