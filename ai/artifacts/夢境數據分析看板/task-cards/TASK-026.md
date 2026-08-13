# AI-Ready 任務卡

## Metadata

- 任務：情緒分佈圓餅圖與統計摘要卡
- 上層規格：ai/artifacts/夢境數據分析看板/feature-spec.md
- 上層 Epic：夢境數據分析看板
- 上層 User Story：情緒分佈圓餅圖與統計摘要卡
- 分軌：前端
- 前置任務（dependsOn）：TASK-022
- 狀態：草稿
- 風險等級：低
- Agent owner：待指派
- 人工核准者：待指派

## 目標

顯示整體情緒佔比圓餅圖，並搭配總完成篇數、平均字數等統計摘要卡片。

## 情境包（Context Pack）

- 相關檔案：
  - src/pages/insights/EmotionPieChart.tsx
  - src/pages/insights/StatsSummaryCards.tsx
- 既有模式：
  - 沿用 TASK-022 的統計 hook 與 TASK-023 選定的圖表函式庫
- 假設：
  - 無
- 未知事項：
  - 無
- 允許變更的檔案：
  - src/pages/insights/**
- 不得觸碰：
  - 依 AGENTS.md 一般規則：不得變更不相關檔案

## 需求

- 圓餅圖顯示各情緒分類佔比。
- 摘要卡顯示總完成篇數、平均字數、記錄天數等基本統計。

## 驗收標準

- 圓餅圖佔比總和為 100%；摘要卡數字與實際 LocalStorage 資料一致。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：佔比與摘要統計計算邏輯測試
- 整合測試：無
- E2E 測試：從完成一篇日記到分析看板確認統計更新
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：圓餅圖與摘要卡截圖
- 安全性檢查：無

## 完成證據

- 變更的檔案：
- 執行過的指令：
- 測試輸出：
- 螢幕截圖：
- 已知限制：
- 後續任務：
