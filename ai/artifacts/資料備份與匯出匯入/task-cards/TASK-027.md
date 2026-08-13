# AI-Ready 任務卡

## Metadata

- 任務：匯出全部資料為 JSON
- 上層規格：ai/artifacts/資料備份與匯出匯入/feature-spec.md
- 上層 Epic：資料備份與匯出匯入
- 上層 User Story：匯出全部資料為 JSON
- 分軌：前端
- 前置任務（dependsOn）：TASK-001、TASK-002、TASK-003、TASK-004、TASK-005、TASK-006、TASK-007、TASK-008、TASK-009
- 狀態：草稿
- 風險等級：低
- Agent owner：待指派
- 人工核准者：待指派

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
- 執行過的指令：
- 測試輸出：
- 螢幕截圖：
- 已知限制：
- 後續任務：
