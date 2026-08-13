# AI-Ready 任務卡

## Metadata

- 任務：UI 設計系統 S2：視覺風格方向（Style Tiles）
- 上層規格：ai/artifacts/專案設置/feature-spec.md
- 上層 Epic：專案設置
- 上層 User Story：UI 設計系統／風格指引
- 分軌：前端
- 前置任務（dependsOn）：TASK-004
- 狀態：草稿
- 風險等級：低
- Agent owner：待指派
- 人工核准者：待指派

## 目標

產出 2-3 個仿手繪素描本風格的 style tile 讓人工挑選整體氣質方向。

## 情境包（Context Pack）

- 相關檔案：
  - ai/context/design-system.md
  - ai/artifacts/專案設置/mockups/style-tile-*.html
- 既有模式：
  - 套用 ai/skills/design-craft.md 的設計工藝紀律：色彩情緒、字體個性（Caveat/Architects Daughter 手寫體 + Playfair Display 襯線體）、圓角與陰影傾向、密度、亮暗模式、1-2 個參考產品
- 假設：
  - 以做舊紙張、鉛筆素描為核心意象，3 個 tile 可在暖色調做舊紙、冷色調做舊紙、高對比黑白素描本之間變化
- 未知事項：
  - 無
- 允許變更的檔案：
  - ai/context/design-system.md
  - ai/artifacts/專案設置/mockups/**
- 不得觸碰：
  - 不得使用 S3 尚未定案的 token（此階段本身就是在產生 token 前的方向探索）

## 需求

- 產出 2-3 個 style tile，各自呈現色彩/字體/圓角陰影/密度/明暗模式與參考產品。
- 取得人工核准的風格方向。

## 驗收標準

- design-system.md「風格方向」章節記錄已核准的 tile 與理由。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：無
- 整合測試：無
- E2E 測試：無
- 型別檢查：無
- Lint：無
- Build：無
- 螢幕截圖：3 個 style tile 截圖
- 安全性檢查：無

## 完成證據

- 變更的檔案：
- 執行過的指令：
- 測試輸出：
- 螢幕截圖：
- 已知限制：
- 後續任務：
