# AI-Ready 任務卡

## Metadata

- 任務：分析看板架構基礎（容器、統計工具、空狀態）
- 上層規格：ai/artifacts/夢境數據分析看板/feature-spec.md
- 上層 Epic：夢境數據分析看板
- 上層 User Story：資料不足時的空狀態設計
- 分軌：前端
- 前置任務（dependsOn）：TASK-001、TASK-002、TASK-003、TASK-004、TASK-005、TASK-006、TASK-007、TASK-008、TASK-009
- 狀態：草稿
- 風險等級：低
- Agent owner：待指派
- 人工核准者：待指派

## 目標

建立頁面二的共用容器，套用 S5 已核准版型，提供讀取 completed 日記並計算共用統計的工具函式，並實作完成篇數為 0 時四個圖表區塊一致的空狀態。

## 情境包（Context Pack）

- 相關檔案：
  - src/pages/insights/InsightsPage.tsx
  - src/pages/insights/useDreamStats.ts
- 既有模式：
  - 沿用 design-system.md 頁面二版型；資料來源為 src/lib/dream-storage.ts 的 listCompleted
- 假設：
  - 無
- 未知事項：
  - 無
- 允許變更的檔案：
  - src/pages/insights/**
- 不得觸碰：
  - 不得修改日記記錄或 AI 引擎 Epic 的程式碼
  - 不得引入未登記在元件庫 inventory 的新元件

## 需求

- 提供共用的統計計算 hook/工具，供後續 4 個圖表卡片共用（避免各自重複讀取與計算）。
- 完成篇數為 0 時，所有圖表區塊顯示一致的引導文案與「前往寫日記」CTA。

## 驗收標準

- 空狀態與有資料狀態切換正確；空狀態文案在四個區塊一致。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：統計 hook 基本聚合邏輯測試
- 整合測試：與 dream-storage 的讀取整合測試
- E2E 測試：無（併入各圖表卡片）
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：空狀態畫面截圖，比對 S5 版型
- 安全性檢查：無

## 完成證據

- 變更的檔案：
- 執行過的指令：
- 測試輸出：
- 螢幕截圖：
- 已知限制：
- 後續任務：
