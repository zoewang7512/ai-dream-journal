# AI-Ready 任務卡

## Metadata

- 任務：翻頁瀏覽歷史夢境
- 上層規格：ai/artifacts/核心夢境日記記錄/feature-spec.md
- 上層 Epic：核心夢境日記記錄
- 上層 User Story：翻頁瀏覽歷史夢境
- 分軌：前端
- 前置任務（dependsOn）：TASK-010
- 狀態：草稿
- 風險等級：低
- Agent owner：待指派
- 人工核准者：待指派

## 目標

提供上一篇/下一篇導覽，讓使用者以翻頁方式依日期順序瀏覽已完成的過去紀錄。

## 情境包（Context Pack）

- 相關檔案：
  - src/pages/journal/HistoryNavigator.tsx
- 既有模式：
  - 沿用元件庫的按鈕元件；資料來源為 dream-storage 的 listCompleted
- 假設：
  - 無
- 未知事項：
  - 無
- 允許變更的檔案：
  - src/pages/journal/**
- 不得觸碰：
  - 依 AGENTS.md 一般規則：不得變更不相關檔案

## 需求

- 依日期排序列出所有 completed 紀錄，提供上一篇/下一篇切換。
- 到達最早/最新紀錄時對應方向按鈕停用。
- 完全沒有歷史紀錄時顯示空狀態引導。

## 驗收標準

- 導覽在有資料、邊界、無資料三種情況下行為正確。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：導覽索引計算邏輯測試
- 整合測試：與 dream-storage 的讀取整合測試
- E2E 測試：無（併入下一張詳情卡的 E2E）
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：有紀錄/邊界/空狀態三種截圖
- 安全性檢查：無

## 完成證據

- 變更的檔案：
- 執行過的指令：
- 測試輸出：
- 螢幕截圖：
- 已知限制：
- 後續任務：
