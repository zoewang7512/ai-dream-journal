# AI-Ready 任務卡

## Metadata

- 任務：UI 設計系統 S5：頁面二（夢境數據統計看板）版面 mockup
- 上層規格：ai/artifacts/專案設置/feature-spec.md
- 上層 Epic：專案設置
- 上層 User Story：UI 設計系統／風格指引
- 分軌：前端
- 前置任務（dependsOn）：TASK-007
- 狀態：草稿
- 風險等級：低
- Agent owner：待指派
- 人工核准者：待指派

## 目標

用已定案的 token 與元件庫，為頁面二拼出 2-3 個完整版面變體，讓人工選定一個方向。

## 情境包（Context Pack）

- 相關檔案：
  - ai/artifacts/專案設置/mockups/page2-variant-*.html
  - ai/context/design-system.md
- 既有模式：
  - 套用 ui-mockup-gate 流程；只能使用 S4 已登記的元件與 S3 的 token
- 假設：
  - 需涵蓋 4 個圖表區塊（折線圖/文字雲/熱力圖/圓餅圖+摘要卡）與空狀態的版面配置
- 未知事項：
  - 無
- 允許變更的檔案：
  - ai/artifacts/專案設置/mockups/**
  - ai/context/design-system.md
- 不得觸碰：
  - 不得引入 S4 元件庫沒有的元件或 S3 沒有的 token

## 需求

- 產出 2-3 個頁面二整體版型變體。
- 取得人工核准的版型。

## 驗收標準

- design-system.md 記錄頁面二已選定的版型。

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
- 螢幕截圖：2-3 個版型變體截圖
- 安全性檢查：無

## 完成證據

- 變更的檔案：
- 執行過的指令：
- 測試輸出：
- 螢幕截圖：
- 已知限制：
- 後續任務：
