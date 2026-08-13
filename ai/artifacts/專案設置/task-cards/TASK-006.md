# AI-Ready 任務卡

## Metadata

- 任務：UI 設計系統 S3：Design Token
- 上層規格：ai/artifacts/專案設置/feature-spec.md
- 上層 Epic：專案設置
- 上層 User Story：UI 設計系統／風格指引
- 分軌：前端
- 前置任務（dependsOn）：TASK-005
- 狀態：草稿
- 風險等級：低
- Agent owner：待指派
- 人工核准者：待指派

## 目標

從已核准的風格方向定義完整 primitive token 與 semantic token，並產出可執行的 token 檔案。

## 情境包（Context Pack）

- 相關檔案：
  - ai/context/design-system.md
  - src/styles/tokens.css（或等效）
- 既有模式：
  - 套用 design-craft.md 的 type scale、4 的倍數間距、色彩系統分階規則
- 假設：
  - 無
- 未知事項：
  - 無
- 允許變更的檔案：
  - ai/context/design-system.md
  - src/styles/**
- 不得觸碰：
  - 不得引入 S2 未核准的色彩/字體

## 需求

- 定義色票、字級 scale、字重、行高、間距 scale、圓角、陰影、z-index、動效時間曲線。
- 定義語意層 token（color.primary、color.surface、color.danger、space.page 等）。
- 產出真實可執行的 tokens.css 並在 design-system.md 記錄路徑。

## 驗收標準

- design-system.md「Design Token 清單」完整列出並經人工核准。
- tokens.css 可被前端專案實際引用。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：無
- 整合測試：無
- E2E 測試：無
- 型別檢查：無
- Lint：CSS lint（若專案有設定）
- Build：前端可正常引用 tokens.css 建置成功
- 螢幕截圖：色票/字級/間距 token 一覽截圖
- 安全性檢查：無

## 完成證據

- 變更的檔案：
- 執行過的指令：
- 測試輸出：
- 螢幕截圖：
- 已知限制：
- 後續任務：
