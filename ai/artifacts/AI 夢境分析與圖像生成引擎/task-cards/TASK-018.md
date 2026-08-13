# AI-Ready 任務卡

## Metadata

- 任務：手繪風格 Prompt 工程（強制素描修飾詞注入）
- 上層規格：ai/artifacts/AI 夢境分析與圖像生成引擎/feature-spec.md
- 上層 Epic：AI 夢境分析與圖像生成引擎
- 上層 User Story：手繪風格 Prompt 工程
- 分軌：後端
- 前置任務（dependsOn）：TASK-017
- 狀態：草稿
- 風險等級：低
- Agent owner：待指派
- 人工核准者：待指派

## 目標

在送往 Gemini 的系統提示詞與最終 imagePrompt 中強制注入手繪素描風格修飾詞，確保輸出不含色彩描述。

## 情境包（Context Pack）

- 相關檔案：
  - server/lib/prompt-templates.ts
- 既有模式：
  - 系統提示詞明確要求 Gemini 在 imagePrompt 開頭與結尾加入：pencil sketch, graphite sketch, observational drawing, hand-drawn lines, cross-hatching for shading, rugged lines, monochromatic, black and white sketch, on aged textured paper with imperfections
- 假設：
  - 無
- 未知事項：
  - 無
- 允許變更的檔案：
  - server/**
- 不得觸碰：
  - 依 AGENTS.md 一般規則：不得變更不相關檔案

## 需求

- 系統提示詞需明確要求純黑白/單色調，不得產生任何色彩描述詞。
- 若 Gemini 回傳的 imagePrompt 缺少必要修飾詞，後端需在送往前端前補上（防呆）。

## 驗收標準

- 對多個測試輸入，回傳的 imagePrompt 皆包含全部指定修飾詞、不含色彩詞彙。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：prompt 組裝與防呆補上邏輯測試（含修飾詞缺失情境）
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
