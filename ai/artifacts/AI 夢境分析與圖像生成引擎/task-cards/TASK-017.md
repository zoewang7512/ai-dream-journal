# AI-Ready 任務卡

## Metadata

- 任務：Gemini 結構化分析 API 實作
- 上層規格：ai/artifacts/AI 夢境分析與圖像生成引擎/feature-spec.md
- 上層 Epic：AI 夢境分析與圖像生成引擎
- 上層 User Story：Gemini 結構化分析 API
- 分軌：後端
- 前置任務（dependsOn）：TASK-016
- 狀態：草稿
- 風險等級：中
- Agent owner：待指派
- 人工核准者：待指派

## 目標

呼叫 Gemini API 將夢境文字轉換為結構化 JSON（mood、keywords、imagePrompt），並產生隨機 seed 一併回傳。

## 情境包（Context Pack）

- 相關檔案：
  - server/routes/dream-analysis.ts
  - server/lib/gemini-client.ts
- 既有模式：
  - 沿用 TASK-016 的路由骨架
- 假設：
  - mood 為固定情緒分類 enum（例如 anxious/calm/excited/sad/scary/happy 等，實作時可依 Gemini 實際回傳調整並記錄於完成證據）
- 未知事項：
  - 無
- 允許變更的檔案：
  - server/**
- 不得觸碰：
  - 依 AGENTS.md 一般規則：不得變更不相關檔案

## 需求

- 呼叫 Gemini API 並解析回傳為結構化 JSON。
- 產生一個隨機 seed（例如 32-bit 整數）與分析結果一併回傳。
- 回傳格式不符預期時，視為 invalid_response 錯誤，不得讓壞資料流向前端。

## 驗收標準

- 成功情境回傳 200 { mood, keywords, imagePrompt, seed }。
- Gemini 回傳格式異常時回傳結構化錯誤而非 500 崩潰。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：回應解析與 seed 產生邏輯測試
- 整合測試：mock Gemini 回應的成功/異常格式測試
- E2E 測試：無
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：無額外
- 螢幕截圖：無
- 安全性檢查：確認呼叫記錄不落地儲存使用者夢境內容

## 完成證據

- 變更的檔案：
- 執行過的指令：
- 測試輸出：
- 螢幕截圖：
- 已知限制：
- 後續任務：
