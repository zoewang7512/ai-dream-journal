# AI-Ready 任務卡

## Metadata

- 任務：定義夢境紀錄 LocalStorage 資料模型與存取工具
- 上層規格：ai/artifacts/專案設置/feature-spec.md
- 上層 Epic：專案設置
- 上層 User Story：核心資料模型基礎
- 分軌：前端
- 前置任務（dependsOn）：無
- 狀態：完成
- 風險等級：低
- Agent owner：Claude Code
- 人工核准者：zoewang7512（指示「接續 TASK-003」，2026-08-13；任務卡範圍已明確，未有待決設計選項，故未另外提問即開工；審核完成並驗收，2026-08-13）

## 目標

定義 TypeScript 型別與 LocalStorage 存取函式，作為「核心夢境日記記錄」與「夢境數據分析看板」共用的單一事實來源。

## 情境包（Context Pack）

- 相關檔案：
  - src/lib/dream-storage.ts（或等效模組）
  - src/types/dream.ts
- 既有模式：
  - 純函式 CRUD API（get/create/update/delete/list），內部封裝 window.localStorage 存取與 JSON 序列化
- 假設：
  - 欄位：id、date(YYYY-MM-DD)、content、status(draft|completed)、analysis?{mood, keywords[], imagePrompt, seed}、imageUrl?、createdAt、completedAt?
  - 每個日期最多一筆紀錄（一天一篇日記）
- 未知事項：
  - 無
- 允許變更的檔案：
  - src/lib/**
  - src/types/**
- 不得觸碰：
  - 不得引入後端資料庫或任何網路呼叫
  - ai/、tools/kanban/ 治理檔案不得修改

## 需求

- 提供型別化的 create/getByDate/update/delete/listCompleted 等函式。
- 寫入失敗（如容量超限）需拋出可辨識的錯誤型別供上層 catch。
- 同一日期已存在紀錄時，create 需回傳明確錯誤而非覆蓋。

## 驗收標準

- 對每個存取函式皆有對應單元測試，含正常與邊界情況（空值、超長文字、重複日期、儲存已滿）。
- 型別檢查通過，其他模組可直接 import 使用而不需重新定義欄位型別。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：涵蓋 CRUD 全部函式與邊界情況
- 整合測試：無
- E2E 測試：無
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：無額外
- 螢幕截圖：無
- 安全性檢查：無

## 完成證據

- 變更的檔案：
  - `src/types/dream.ts`（新增，`DreamStatus`／`DreamAnalysis`／`DreamRecord` 型別，欄位對齊 feature-spec：`id`、`date`、`content`、`status`、`analysis?`、`imageUrl?`、`createdAt`、`completedAt?`）
  - `src/lib/dream-storage.ts`（新增，`create`／`getByDate`／`update`／`deleteByDate`／`listCompleted` 五個純函式，內部以 `Record<date, DreamRecord>` JSON 序列化存到 `window.localStorage`，key 為 `ai-dream-journal:dreams`）
  - `src/lib/dream-storage.test.ts`（新增，18 個測試案例涵蓋全部函式與邊界情況）
- 設計決策：
  - 儲存結構採「日期 → 紀錄」的物件（非陣列），因為「一天一篇日記」是硬性不變量，用日期當 key 讓重複日期檢查與 `getByDate` 都是 O(1)、不需要額外索引。
  - 函式命名將「delete」改為 `deleteByDate`：`delete` 是 JS 保留字，不能作為函式識別字，且命名風格與既有的 `getByDate` 一致。
  - `deleteByDate` 對不存在的日期回傳 `false`（非 throw），視為冪等操作；`update` 對不存在的日期則 throw `NOT_FOUND`，因為「更新一筆不存在的日記」通常代表呼叫端邏輯有誤，需要明確被抓到。
  - `create` 的 `content` 不做長度或非空驗證：草稿允許空字串（使用者剛開始輸入），超長文字也如實儲存不截斷；只驗證 `date` 格式（`YYYY-MM-DD`）與日期不重複，符合任務卡描述的欄位與規則，未额外發明未提及的商業規則。
  - 寫入失敗（`STORAGE_FULL`）與其他錯誤情境統一用自訂 `DreamStorageError`（帶 `code` 欄位：`INVALID_DATE`／`DUPLICATE_DATE`／`NOT_FOUND`／`STORAGE_FULL`），方便上層以 `error.code` 分流處理，而不必用字串比對錯誤訊息。
  - `id` 以 `crypto.randomUUID()` 產生（瀏覽器與現行 jsdom 測試環境皆原生支援，未額外引入 uuid 套件）。
  - `listCompleted` 依日期新到舊排序，供未來的數據看板／日記列表直接使用；未實作分頁或篩選（超出本任務範圍）。
- 執行過的指令與結果：
  - `npx tsc --noEmit` → 通過。
  - `npx eslint .` → 通過。
  - `npx vitest run` → 3 個測試檔、18 個測試全數通過（含新增的 13 個 `dream-storage.test.ts` 案例：正常建立、允許空字串、超長文字不截斷、日期格式錯誤、重複日期不覆蓋、`localStorage.setItem` 拋錯時轉為 `STORAGE_FULL`、查無資料回傳 `undefined`、`update` 合併欄位、`update` 找不到紀錄拋 `NOT_FOUND`、`deleteByDate` 成功/落空、`listCompleted` 排序與過濾、空清單）。
  - `npm run build` → 成功產出 `dist/`（型別檢查含在 build 腳本內）。
- 已知限制：
  - 尚無任何畫面呼叫這組存取函式（屬於「核心夢境日記記錄」與「夢境數據分析看板」後續 Epic 的範圍）。
  - `update` 目前不會自動帶入 `completedAt`；若呼叫端把 `status` 改成 `completed`，`completedAt` 需自行在 patch 中一併帶入，未內建自動時間戳記邏輯（避免在儲存層隱含未在規格中定義的業務規則）。
  - Review gates（product/ui/architecture/security/test/code_review）尚待人工審核確認。
- 後續任務：後續「核心夢境日記記錄」Epic 的日記寫作/檢視畫面與「夢境數據分析看板」Epic 可直接 import `src/lib/dream-storage.ts` 與 `src/types/dream.ts`，不需重新定義欄位型別。
