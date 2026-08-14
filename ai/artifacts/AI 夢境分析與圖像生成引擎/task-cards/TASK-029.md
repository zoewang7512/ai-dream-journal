# AI-Ready 任務卡

## Metadata

- 任務：Gemini 上游錯誤訊息脫敏
- 上層規格：ai/artifacts/AI 夢境分析與圖像生成引擎/feature-spec.md
- 上層 Epic：AI 夢境分析與圖像生成引擎
- 上層 User Story：Gemini 結構化分析 API
- 分軌：後端
- 前置任務（dependsOn）：TASK-017、TASK-020
- 狀態：草稿
- 風險等級：中
- Agent owner：待指派
- 人工核准者：待指派

## 目標

`/api/dream-analysis` 呼叫 Gemini 失敗時，不得把上游 SDK 的原始錯誤訊息（`error.message`）原樣回傳給前端，避免夾帶專案代號、模型名稱、配額等內部細節，並降低未來傳輸機制變動時意外洩漏敏感資訊的風險。

## 情境包（Context Pack）

- 相關檔案：
  - server/lib/analyze-dream.ts（第 73-76 行：`catch` 區塊把 `error.message` 包進 `DreamAnalysisError`）
  - server/lib/dream-analysis-types.ts（`DreamAnalysisError` 定義）
  - server/routes/dream-analysis.ts（第 55-65 行左右：把 `DreamAnalysisError` 的訊息放進 HTTP 回應 body）
  - server/routes/dream-analysis.test.ts
- 既有模式：
  - 非 `DreamAnalysisError` 的例外走固定文案分支（已存在，可參考其寫法）。
- 假設：
  - 伺服器端 log／debug 仍可保留完整原始錯誤，只有回給前端的 HTTP 回應需要脫敏。
- 未知事項：
  - 無
- 允許變更的檔案：
  - server/**
- 不得觸碰：
  - 前端 src/**（此卡純後端錯誤處理）

## 需求

- `upstream_error` 類型的錯誤，回應前端的訊息改為固定文案（不含 `error.message` 原文）。
- 原始錯誤訊息可保留在伺服器端（例如傳給 log 或維持在 `cause` 供伺服器內部除錯），不得出現在 HTTP response body。
- 其餘既有錯誤分類（`invalid_response` 等）行為不變。

## 驗收標準

- 對 `/api/dream-analysis` 送出會觸發 Gemini SDK 拋錯的情境（測試以 mock 模擬），回應 body 不含任何 mock 的原始錯誤字串，只含固定文案。
- 既有測試（`server/routes/dream-analysis.test.ts`、`server/lib/analyze-dream.test.ts`）全數通過，不因此改動而回歸。

## 實作備註

- 本卡源自 TASK-020 Security Gate 審查的附帶發現（F1），詳見 [TASK-020.md](TASK-020.md) 完成證據。
- 開工前先讀 `ai/context/design-system.md`：不適用（無 UI 變更）。

## 驗證契約

- 單元測試：analyze-dream.ts 錯誤處理分支測試
- 整合測試：dream-analysis 路由回應內容測試（確認不含原始錯誤字串）
- E2E 測試：無
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：vite build 成功
- 螢幕截圖：無
- 安全性檢查：確認回應 body 不含上游錯誤原文

## 完成證據

- 變更的檔案：
- 執行過的指令：
- 測試輸出：
- 螢幕截圖：
- 已知限制：
- 後續任務：
