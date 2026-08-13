# AI-Ready 任務卡

## Metadata

- 任務：匯入 JSON 恢復資料（含格式驗證與錯誤提示）
- 上層規格：ai/artifacts/資料備份與匯出匯入/feature-spec.md
- 上層 Epic：資料備份與匯出匯入
- 上層 User Story：匯入 JSON 恢復資料
- 分軌：前端
- 前置任務（dependsOn）：TASK-027
- 狀態：草稿
- 風險等級：中
- Agent owner：待指派
- 人工核准者：待指派

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
- 執行過的指令：
- 測試輸出：
- 螢幕截圖：
- 已知限制：
- 後續任務：
