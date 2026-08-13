# AI-Ready 任務卡

## Metadata

- 任務：定義夢境紀錄 LocalStorage 資料模型與存取工具
- 上層規格：ai/artifacts/專案設置/feature-spec.md
- 上層 Epic：專案設置
- 上層 User Story：核心資料模型基礎
- 分軌：前端
- 前置任務（dependsOn）：無
- 狀態：草稿
- 風險等級：低
- Agent owner：待指派
- 人工核准者：待指派

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
- 執行過的指令：
- 測試輸出：
- 螢幕截圖：
- 已知限制：
- 後續任務：
