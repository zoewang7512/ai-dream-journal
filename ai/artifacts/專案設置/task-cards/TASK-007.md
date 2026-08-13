# AI-Ready 任務卡

## Metadata

- 任務：UI 設計系統 S4：核心元件庫
- 上層規格：ai/artifacts/專案設置/feature-spec.md
- 上層 Epic：專案設置
- 上層 User Story：UI 設計系統／風格指引
- 分軌：前端
- 前置任務（dependsOn）：TASK-006
- 狀態：草稿
- 風險等級：低
- Agent owner：待指派
- 人工核准者：待指派

## 目標

只用 S3 的 token 做出基礎元件庫，涵蓋必要狀態，並登記進 design-system.md 的元件庫 inventory。

## 情境包（Context Pack）

- 相關檔案：
  - ai/context/design-system.md
  - src/components/ui/**
- 既有模式：
  - 套用 design-craft.md，元件涵蓋 button、input、select、checkbox/radio、card、nav、modal/dialog、table、form、toast/alert
- 假設：
  - 依本專案需要，table 可能用不到（無表格化資料需求），但仍需在任務卡執行時依實際使用場景增減並記錄理由
- 未知事項：
  - 無
- 允許變更的檔案：
  - ai/context/design-system.md
  - src/components/ui/**
- 不得觸碰：
  - 不得自創未登記在 S3 的新 token

## 需求

- 每個元件涵蓋必要狀態：預設、hover、focus、停用、載入、錯誤（依元件性質適用者）。
- 每做一個元件就登記進 design-system.md 元件庫 inventory（元件名/狀態/用到的 token/檔案位置/截圖）。

## 驗收標準

- 元件庫 inventory 完整記錄本任務新增的所有元件。
- 所有元件僅使用 S3 已核准的 token，無自創色彩或間距。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：各元件的基本 render 測試
- 整合測試：無
- E2E 測試：無
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：每個元件各狀態截圖
- 安全性檢查：無

## 完成證據

- 變更的檔案：
- 執行過的指令：
- 測試輸出：
- 螢幕截圖：
- 已知限制：
- 後續任務：
