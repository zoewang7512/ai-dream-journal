# AI-Ready 任務卡

## Metadata

- 任務：AI 引擎架構基礎：/api/dream-analysis 路由骨架
- 上層規格：ai/artifacts/AI 夢境分析與圖像生成引擎/feature-spec.md
- 上層 Epic：AI 夢境分析與圖像生成引擎
- 上層 User Story：Gemini 結構化分析 API
- 分軌：後端
- 前置任務（dependsOn）：TASK-001、TASK-002、TASK-003、TASK-004、TASK-005、TASK-006、TASK-007、TASK-008、TASK-009
- 狀態：草稿
- 風險等級：中
- Agent owner：待指派
- 人工核准者：待指派

## 目標

建立後端 /api/dream-analysis 路由骨架、Gemini client 初始化、請求驗證與統一錯誤回應格式，供後續各卡片擴充。

## 情境包（Context Pack）

- 相關檔案：
  - server/routes/dream-analysis.ts
  - server/lib/gemini-client.ts
- 既有模式：
  - 沿用 Epic0 TASK-001 的 Express app 結構；錯誤回應統一格式 { errorType, message }
- 假設：
  - 無
- 未知事項：
  - 無
- 允許變更的檔案：
  - server/**
- 不得觸碰：
  - 不得在此卡片實作最終 prompt 內容或圖片組裝邏輯（屬後續卡片）

## 需求

- POST /api/dream-analysis 接受 { content: string }，缺少或空白時回傳 400。
- 初始化 Gemini client（讀取 GEMINI_API_KEY，缺少時依 Epic0 TASK-002 的 fail-fast 規則處理）。
- 統一錯誤回應格式，含 errorType 欄位。

## 驗收標準

- 空 body 或空 content 回傳 400。
- 路由骨架可被後續卡片擴充而不需重構。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：請求驗證邏輯測試
- 整合測試：路由層基本整合測試（mock Gemini client）
- E2E 測試：無
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：無額外
- 螢幕截圖：無
- 安全性檢查：確認金鑰只在伺服器端讀取

## 完成證據

- 變更的檔案：
- 執行過的指令：
- 測試輸出：
- 螢幕截圖：
- 已知限制：
- 後續任務：
