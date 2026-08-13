# AI-Ready 任務卡

## Metadata

- 任務：情緒趨勢折線圖
- 上層規格：ai/artifacts/夢境數據分析看板/feature-spec.md
- 上層 Epic：夢境數據分析看板
- 上層 User Story：情緒趨勢折線圖
- 分軌：前端
- 前置任務（dependsOn）：TASK-022
- 狀態：草稿
- 風險等級：低
- Agent owner：待指派
- 人工核准者：待指派

## 目標

依時間軸顯示夢境情緒分類的變化趨勢。

## 情境包（Context Pack）

- 相關檔案：
  - src/pages/insights/EmotionTrendChart.tsx
- 既有模式：
  - 沿用 TASK-022 的統計 hook；圖表函式庫選型需列 2-3 個選項（如 Recharts、Chart.js、純 SVG）比較後決定並記錄
- 假設：
  - 無
- 未知事項：
  - 圖表函式庫選型——實作時列選項請人工確認或依專案已有慣例決定
- 允許變更的檔案：
  - src/pages/insights/**
- 不得觸碰：
  - 依 AGENTS.md 一般規則：不得變更不相關檔案

## 需求

- X 軸為日期、Y 軸為情緒分類，依全部歷史 completed 資料繪製。
- 僅 1 篇資料時需優雅顯示單點，不得報錯或留白當機。

## 驗收標準

- 多筆與單筆資料情境皆正確渲染。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：資料轉換為圖表座標的邏輯測試
- 整合測試：無
- E2E 測試：無
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：多筆與單筆資料的折線圖截圖
- 安全性檢查：無

## 完成證據

- 變更的檔案：
- 執行過的指令：
- 測試輸出：
- 螢幕截圖：
- 已知限制：
- 後續任務：
