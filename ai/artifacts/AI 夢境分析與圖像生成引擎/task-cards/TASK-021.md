# AI-Ready 任務卡

## Metadata

- 任務：Gemini/Pollinations 呼叫失敗、逾時、額度超限的錯誤處理
- 上層規格：ai/artifacts/AI 夢境分析與圖像生成引擎/feature-spec.md
- 上層 Epic：AI 夢境分析與圖像生成引擎
- 上層 User Story：呼叫失敗/逾時/額度超限的錯誤處理
- 分軌：後端
- 前置任務（dependsOn）：TASK-017
- 狀態：草稿
- 風險等級：低
- Agent owner：待指派
- 人工核准者：待指派

## 目標

為 Gemini 呼叫加上逾時與錯誤分類處理，回傳結構化錯誤供前端顯示對應提示，並加上基本防濫用機制。

## 情境包（Context Pack）

- 相關檔案：
  - server/routes/dream-analysis.ts
  - server/lib/gemini-client.ts
- 既有模式：
  - 逾時門檻 15 秒；錯誤分類：timeout/quota_exceeded/invalid_response/upstream_error
- 假設：
  - 防濫用機制以基本 origin 檢查或簡易記憶體內速率限制實作即可，不需引入額外資料庫（單人專案、低流量）
- 未知事項：
  - 無
- 允許變更的檔案：
  - server/**
- 不得觸碰：
  - 依 AGENTS.md 一般規則：不得變更不相關檔案

## 需求

- Gemini 呼叫逾時（>15 秒）需主動中止並回傳 errorType=timeout。
- Gemini 回傳額度/配額錯誤時，對應 errorType=quota_exceeded。
- 端點加上基本 origin 檢查或速率限制，非預期來源或超額請求回傳 429/403。

## 驗收標準

- 模擬逾時、額度錯誤、非預期格式三種情境，皆回傳對應 errorType 而非讓請求掛住或 500 崩潰。
- 模擬異常來源或高頻請求，防濫用機制生效。

## 實作備註

- 開工前先讀 `ai/context/design-system.md`（若為前端/UI 任務），能重用既有 token 與元件就必須重用。
- 若需要探索現成套件（例如圖表函式庫），列 2-3 個選項附優劣與建議，只有明顯唯一選擇時才不用問。

## 驗證契約

- 單元測試：錯誤分類與逾時邏輯測試
- 整合測試：mock 逾時/額度錯誤情境的整合測試
- E2E 測試：無
- 型別檢查：tsc --noEmit
- Lint：專案 lint 指令
- Build：無額外
- 螢幕截圖：無
- 安全性檢查：防濫用機制（origin 檢查/速率限制）驗證

## 完成證據

- 變更的檔案：
- 執行過的指令：
- 測試輸出：
- 螢幕截圖：
- 已知限制：
- 後續任務：
